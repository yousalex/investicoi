import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all user profiles with plan info
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select(`
        *,
        plan_limits(daily_usage_limit, price_monthly, description)
      `);

    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }

    // Send data to Google Sheets webhook
    for (const profile of profiles || []) {
      const formData = new FormData();
      formData.append("user_id", profile.id);
      formData.append("email", profile.email);
      formData.append("plan", profile.plan);
      formData.append("plan_expires_at", profile.plan_expires_at || "");
      formData.append("daily_usage_count", profile.daily_usage_count.toString());
      formData.append("last_usage_reset", profile.last_usage_reset);
      formData.append("created_at", profile.created_at);
      formData.append("plan_limit", profile.plan_limits?.daily_usage_limit?.toString() || "0");
      formData.append("plan_price", profile.plan_limits?.price_monthly?.toString() || "0");

      try {
        const response = await fetch("http://localhost:5678/webhook-test/enviar", {
          method: "POST",
          body: formData,
        });

        console.log(`Sent data for user ${profile.email}, response status:`, response.status);
      } catch (webhookError) {
        console.error(`Failed to send data for user ${profile.email}:`, webhookError);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Data sync completed", 
        users_synced: profiles?.length || 0 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in sync-to-sheets function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});