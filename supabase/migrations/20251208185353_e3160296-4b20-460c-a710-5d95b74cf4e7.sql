-- Mark stale jobs as failed (jobs stuck in processing for months)
UPDATE jobs 
SET status = 'failed', 
    error_message = 'Stale job - stuck in processing since September 2025', 
    updated_at = NOW() 
WHERE status = 'processing' 
AND created_at < '2025-10-01';