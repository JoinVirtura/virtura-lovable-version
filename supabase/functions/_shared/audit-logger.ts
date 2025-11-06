import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

export interface AuditLogEntry {
  adminId: string;
  adminEmail: string;
  actionType: string;
  targetType?: string;
  targetId?: string;
  details: Record<string, any>;
}

export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase.from('admin_audit_logs').insert({
    admin_id: entry.adminId,
    admin_email: entry.adminEmail,
    action_type: entry.actionType,
    target_type: entry.targetType || null,
    target_id: entry.targetId || null,
    details: entry.details,
  });

  if (error) {
    console.error('Failed to log admin action:', error);
  }
}
