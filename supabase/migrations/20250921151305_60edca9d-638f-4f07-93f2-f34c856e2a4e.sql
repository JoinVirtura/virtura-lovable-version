-- Fix function search path security warnings
DROP FUNCTION IF EXISTS update_gpu_worker_heartbeat(TEXT);
CREATE OR REPLACE FUNCTION update_gpu_worker_heartbeat(worker_id_param TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE gpu_workers 
  SET last_heartbeat = now(), updated_at = now()
  WHERE worker_id = worker_id_param;
$$;

DROP FUNCTION IF EXISTS assign_job_to_gpu(UUID, INTEGER);
CREATE OR REPLACE FUNCTION assign_job_to_gpu(job_id_param UUID, required_vram INTEGER DEFAULT 8192)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
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

-- Fix the existing update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;