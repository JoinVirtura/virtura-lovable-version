-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule trial expiration email notifications to run daily at 10:00 AM UTC
SELECT cron.schedule(
  'send-trial-expiration-emails',
  '0 10 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/send-trial-expiration-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
