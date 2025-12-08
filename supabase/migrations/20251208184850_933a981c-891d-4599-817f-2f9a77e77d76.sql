-- Enable REPLICA IDENTITY FULL for real-time updates on jobs and token_transactions tables
ALTER TABLE jobs REPLICA IDENTITY FULL;
ALTER TABLE token_transactions REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'token_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE token_transactions;
  END IF;
END $$;