-- Fix the existing update_updated_at_column function with CASCADE
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

-- Recreate all the triggers that were dropped
DROP TRIGGER IF EXISTS update_avatar_library_updated_at ON avatar_library;
CREATE TRIGGER update_avatar_library_updated_at
  BEFORE UPDATE ON avatar_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_talking_avatars_updated_at ON talking_avatars;
CREATE TRIGGER update_talking_avatars_updated_at
  BEFORE UPDATE ON talking_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_renders_updated_at ON renders;
CREATE TRIGGER update_renders_updated_at
  BEFORE UPDATE ON renders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voice_cache_updated_at ON voice_cache;
CREATE TRIGGER update_voice_cache_updated_at
  BEFORE UPDATE ON voice_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_error_logs_updated_at ON error_logs;
CREATE TRIGGER update_error_logs_updated_at
  BEFORE UPDATE ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
