-- =============================================
-- SUPABASE CRON JOBS SETUP
-- Execute these commands in Supabase SQL Editor
-- =============================================

-- STEP 1: Enable Required Extensions
-- =============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- STEP 2: Process Scheduled Notifications (Every Minute)
-- =============================================
SELECT cron.schedule(
  'process-scheduled-notifications',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
      url:='https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/notification-scheduler',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- STEP 3: Send Daily Metrics Digest (9:00 AM UTC)
-- =============================================
SELECT cron.schedule(
  'send-daily-metrics-digest',
  '0 9 * * *', -- Daily at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/send-metrics-digest',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU"}'::jsonb,
      body:='{"digest_type": "daily"}'::jsonb
    ) as request_id;
  $$
);

-- STEP 4: Send Weekly Metrics Digest (Monday 9:00 AM UTC)
-- =============================================
SELECT cron.schedule(
  'send-weekly-metrics-digest',
  '0 9 * * 1', -- Monday at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/send-metrics-digest',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU"}'::jsonb,
      body:='{"digest_type": "weekly"}'::jsonb
    ) as request_id;
  $$
);

-- STEP 5: Send Monthly Metrics Digest (1st of Month 9:00 AM UTC)
-- =============================================
SELECT cron.schedule(
  'send-monthly-metrics-digest',
  '0 9 1 * *', -- 1st day of month at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/send-metrics-digest',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU"}'::jsonb,
      body:='{"digest_type": "monthly"}'::jsonb
    ) as request_id;
  $$
);

-- STEP 6: Refresh CTR Metrics Materialized View (Daily at 1:00 AM UTC)
-- =============================================
SELECT cron.schedule(
  'refresh-ctr-metrics',
  '0 1 * * *', -- Daily at 1:00 AM UTC
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY notification_ctr_metrics;
  $$
);

-- =============================================
-- VERIFY CRON JOBS
-- =============================================

-- List all scheduled cron jobs
SELECT * FROM cron.job ORDER BY jobname;

-- View recent cron job execution history
SELECT 
  job_run_details.jobid,
  cron.job.jobname,
  job_run_details.status,
  job_run_details.return_message,
  job_run_details.start_time,
  job_run_details.end_time
FROM cron.job_run_details
JOIN cron.job ON cron.job.jobid = job_run_details.jobid
ORDER BY start_time DESC
LIMIT 20;

-- =============================================
-- MANAGE CRON JOBS (if needed)
-- =============================================

-- To unschedule a job (if you need to modify it):
-- SELECT cron.unschedule('process-scheduled-notifications');
-- SELECT cron.unschedule('send-daily-metrics-digest');
-- SELECT cron.unschedule('send-weekly-metrics-digest');
-- SELECT cron.unschedule('send-monthly-metrics-digest');
-- SELECT cron.unschedule('refresh-ctr-metrics');

-- After unscheduling, you can reschedule with updated configuration

-- =============================================
-- NOTES
-- =============================================

-- Cron pattern format: minute hour day_of_month month day_of_week
-- Examples:
--   * * * * *     - Every minute
--   0 * * * *     - Every hour
--   0 9 * * *     - Daily at 9:00 AM
--   0 9 * * 1     - Every Monday at 9:00 AM
--   0 9 1 * *     - First day of month at 9:00 AM
--   */5 * * * *   - Every 5 minutes
--   0 */2 * * *   - Every 2 hours

-- All times are in UTC timezone
-- Convert your desired local time to UTC before scheduling

-- To monitor job execution:
-- 1. Check cron.job_run_details table for execution history
-- 2. Check Edge Function logs for detailed execution logs
-- 3. Use Supabase Dashboard → Database → Cron Jobs for management

-- For troubleshooting:
-- - Ensure pg_cron and pg_net extensions are enabled
-- - Verify Edge Function URLs are correct
-- - Check authorization tokens are valid
-- - Review Edge Function logs for errors
-- - Ensure database has sufficient permissions
