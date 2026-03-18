-- Fix RLS policies for admin audit logs and notifications
-- This migration corrects the policies that were preventing proper inserts

-- Drop the problematic policy for audit logs
DROP POLICY IF EXISTS "Service role can insert audit logs" ON admin_audit_logs;

-- Create a policy that allows inserts from edge functions (using service role)
DROP POLICY IF EXISTS "Allow audit log inserts from edge functions" ON admin_audit_logs;
CREATE POLICY "Allow audit log inserts from edge functions" ON admin_audit_logs
  FOR INSERT WITH CHECK (true);

-- Fix the admin_notifications policy to include proper type casting
DROP POLICY IF EXISTS "Admins can manage notifications" ON admin_notifications;
CREATE POLICY "Admins can manage notifications" ON admin_notifications
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- Fix the admin_audit_logs view policy to include proper type casting
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

-- Add a policy to allow service role to insert notifications (drop first if exists)
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
