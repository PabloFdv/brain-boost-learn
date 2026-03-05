import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PASSWORD = "240619PPM";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { key } = await req.json();
    if (!key || typeof key !== "string") {
      return new Response(JSON.stringify({ valid: false }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedKey = key.trim();

    // Admin is always valid
    if (trimmedKey === ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ valid: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user key exists, is used (active session), and not blocked
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: keyData, error } = await sb
      .from("access_keys")
      .select("used, blocked")
      .eq("key", trimmedKey)
      .maybeSingle();

    if (error) throw error;

    // Key doesn't exist (deleted) or is blocked → invalid
    if (!keyData || keyData.blocked) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Key exists and is not blocked → valid session
    return new Response(JSON.stringify({ valid: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auth-validate error:", e);
    return new Response(
      JSON.stringify({ valid: false, error: e instanceof Error ? e.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
