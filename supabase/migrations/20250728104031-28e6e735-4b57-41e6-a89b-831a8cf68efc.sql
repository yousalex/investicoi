-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily reset and sync to run every day at midnight UTC
SELECT cron.schedule(
  'daily-reset-and-sync',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://yyiwqvnfbswuqjkjpkju.supabase.co/functions/v1/daily-reset',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5aXdxdm5mYnN3dXFqa2pwa2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTA4MDcsImV4cCI6MjA2OTE4NjgwN30.z4M81wcHffyQRXzRpK1jeUKE91m3_wD9oVsLUWebFLU"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);