-- Schedule weekly trial reactivation email campaign
-- Runs every Monday at 10:00 AM UTC
-- Note: pg_cron extension must be enabled in Supabase Dashboard > Database > Extensions
SELECT cron.schedule(
  'send-trial-reactivation-emails-weekly',
  '0 10 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/send-trial-reactivation-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);