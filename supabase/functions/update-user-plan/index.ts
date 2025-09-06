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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Use anon key for auth verification, but service role for database operations
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("Authentication error:", userError);
      throw new Error("User not authenticated");
    }

    const { planId, paymentDetails } = await req.json();
    
    console.log("Updating plan for user:", userData.user.id, "to plan:", planId);
    console.log("Payment details:", paymentDetails);

    // Calculate expiration date based on plan
    const calculateExpirationDate = (plan: string): Date | null => {
      const now = new Date();
      switch (plan) {
        case 'gratuito':
          return null; // Free plan doesn't have expiration
        case 'mensual':
          return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        case 'trimestral':
          return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
        case 'semestral':
          return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 days
        case 'anual':
          return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
        default:
          return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days
      }
    };

    const expirationDate = calculateExpirationDate(planId);

    // Update user's plan in the database
    const { data, error } = await supabaseClient
      .from('profiles')
      .update({
        plan: planId,
        plan_expires_at: expirationDate ? expirationDate.toISOString() : null,
        daily_usage_count: 0, // Reset usage count when upgrading
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.user.id)
      .select();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    console.log("Profile updated successfully:", data);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Plan updated successfully",
        plan: planId,
        expires_at: expirationDate ? expirationDate.toISOString() : null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in update-user-plan:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while updating the plan"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});