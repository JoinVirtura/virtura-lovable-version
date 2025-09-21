-- Create GPU workers table for managing processing infrastructure
CREATE TABLE IF NOT EXISTS gpu_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT UNIQUE NOT NULL,
  gpu_type TEXT NOT NULL, -- 'L40S', '4090', 'A100', 'H100'
  vram_total INTEGER NOT NULL,
  vram_available INTEGER NOT NULL, 
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'busy', 'error', 'maintenance')),
  current_job_id UUID REFERENCES jobs(id),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for GPU workers
ALTER TABLE gpu_workers ENABLE ROW LEVEL SECURITY;

-- Add new columns to jobs table for enhanced tracking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS gpu_requirements JSONB DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS processing_phases TEXT[] DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS worker_id TEXT REFERENCES gpu_workers(worker_id);

-- Create index for efficient job queue queries
CREATE INDEX IF NOT EXISTS idx_jobs_status_priority ON jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_worker_assignment ON jobs(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_gpu_workers_status ON gpu_workers(status, vram_available);

-- Create avatar LoRA models table for identity consistency
CREATE TABLE IF NOT EXISTS avatar_loras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  avatar_name TEXT NOT NULL,
  lora_model_path TEXT,
  training_images TEXT[],
  consistency_score FLOAT DEFAULT 0.0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'training', 'ready', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for avatar LoRAs
ALTER TABLE avatar_loras ENABLE ROW LEVEL SECURITY;

-- Create LoRA policies
CREATE POLICY "Users can manage their own LoRAs" ON avatar_loras
  FOR ALL USING (auth.uid() = user_id);

-- Create style templates table for brand consistency
CREATE TABLE IF NOT EXISTS style_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  lut_settings JSONB DEFAULT '{}',
  camera_settings JSONB DEFAULT '{}',
  lighting_preset TEXT,
  brand_colors TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for style templates
ALTER TABLE style_templates ENABLE ROW LEVEL SECURITY;

-- Create style template policies
CREATE POLICY "Users can manage their own templates" ON style_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON style_templates
  FOR SELECT USING (is_public = true);

-- Create render analytics table for performance tracking
CREATE TABLE IF NOT EXISTS render_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  processing_time_seconds INTEGER,
  gpu_utilization FLOAT,
  vram_peak_usage INTEGER,
  quality_score FLOAT,
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  error_count INTEGER DEFAULT 0,
  pipeline_stage TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for render analytics
ALTER TABLE render_analytics ENABLE ROW LEVEL SECURITY;

-- Create analytics policies
CREATE POLICY "Users can view analytics for their jobs" ON render_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = render_analytics.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

-- Service role can manage all analytics
CREATE POLICY "Service role can manage all analytics" ON render_analytics
  FOR ALL USING (
    (auth.jwt() ->> 'role'::text) = 'service_role'::text
  );

-- Service role can manage GPU workers
CREATE POLICY "Service role can manage GPU workers" ON gpu_workers
  FOR ALL USING (
    (auth.jwt() ->> 'role'::text) = 'service_role'::text
  );

-- Create function to update GPU worker heartbeat
CREATE OR REPLACE FUNCTION update_gpu_worker_heartbeat(worker_id_param TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE gpu_workers 
  SET last_heartbeat = now(), updated_at = now()
  WHERE worker_id = worker_id_param;
$$;

-- Create function to assign job to available GPU worker
CREATE OR REPLACE FUNCTION assign_job_to_gpu(job_id_param UUID, required_vram INTEGER DEFAULT 8192)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH available_worker AS (
    SELECT worker_id 
    FROM gpu_workers 
    WHERE status = 'idle' 
      AND vram_available >= required_vram
      AND last_heartbeat > now() - INTERVAL '5 minutes'
    ORDER BY vram_available DESC
    LIMIT 1
  )
  UPDATE jobs 
  SET worker_id = (SELECT worker_id FROM available_worker),
      status = CASE 
        WHEN (SELECT worker_id FROM available_worker) IS NOT NULL 
        THEN 'processing' 
        ELSE 'queued' 
      END,
      updated_at = now()
  WHERE id = job_id_param
  RETURNING worker_id;
$$;

-- Create trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables with updated_at
DROP TRIGGER IF EXISTS update_gpu_workers_updated_at ON gpu_workers;
CREATE TRIGGER update_gpu_workers_updated_at
  BEFORE UPDATE ON gpu_workers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_avatar_loras_updated_at ON avatar_loras;
CREATE TRIGGER update_avatar_loras_updated_at
  BEFORE UPDATE ON avatar_loras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_style_templates_updated_at ON style_templates;
CREATE TRIGGER update_style_templates_updated_at
  BEFORE UPDATE ON style_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();