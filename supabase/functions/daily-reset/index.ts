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
    console.log("Running daily reset and sync...");

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Reset daily usage for users whose 24 hours have passed
    const { error: resetError } = await supabaseAdmin.rpc('reset_daily_usage');
    
    if (resetError) {
      console.error("Error resetting daily usage:", resetError);
      throw resetError;
    }

    console.log("Daily usage reset completed");

    // Trigger sync to Google Sheets
    const syncResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-to-sheets`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    if (!syncResponse.ok) {
      console.error("Error syncing to sheets:", await syncResponse.text());
    } else {
      console.log("Successfully synced data to Google Sheets");
    }

    return new Response(
      JSON.stringify({ 
        message: "Daily reset and sync completed successfully",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in daily-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});