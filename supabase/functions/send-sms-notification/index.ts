import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, message, notificationId } = await req.json();

    console.log(`Sending SMS to user ${userId}`);

    // Check if Twilio credentials are configured
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return new Response(
        JSON.stringify({ error: 'SMS service not configured. Please add Twilio credentials.' }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's phone number and SMS preferences
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('phone_number, sms_enabled, phone_verified')
      .eq('user_id', userId)
      .single();

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user preferences' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!prefs?.sms_enabled) {
      console.log('SMS notifications not enabled for user');
      return new Response(
        JSON.stringify({ error: 'SMS notifications not enabled' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!prefs?.phone_verified) {
      console.log('Phone not verified for user');
      return new Response(
        JSON.stringify({ error: 'Phone number not verified' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check SMS rate limit
    const { data: canSend } = await supabase.rpc('check_sms_limit', {
      p_user_id: userId,
    });

    if (!canSend) {
      console.log('SMS rate limit exceeded for user');
      return new Response(
        JSON.stringify({ error: 'SMS rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append('To', prefs.phone_number);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Body', message);

    console.log(`Sending SMS to ${prefs.phone_number}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (twilioResponse.ok) {
      console.log('SMS sent successfully:', twilioData.sid);

      // Log successful SMS
      await supabase.from('notification_sms_log').insert({
        user_id: userId,
        notification_id: notificationId,
        to_phone: prefs.phone_number,
        from_phone: TWILIO_PHONE_NUMBER,
        message_body: message,
        twilio_sid: twilioData.sid,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true, sid: twilioData.sid }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error('Twilio error:', twilioData);

      // Log failed SMS
      await supabase.from('notification_sms_log').insert({
        user_id: userId,
        notification_id: notificationId,
        to_phone: prefs.phone_number,
        from_phone: TWILIO_PHONE_NUMBER,
        message_body: message,
        status: 'failed',
        error_message: twilioData.message || 'Unknown error',
      });

      return new Response(
        JSON.stringify({ error: twilioData.message || 'Failed to send SMS' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
