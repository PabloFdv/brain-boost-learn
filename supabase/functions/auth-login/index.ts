import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PASSWORD = "240619PPM";
const ADMIN_NAME = "Pablo Martins Santana";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { key } = await req.json();
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Senha obrigatória" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedKey = key.trim();

    // Admin check
    if (trimmedKey === ADMIN_PASSWORD) {
      const token = crypto.randomUUID();
      return new Response(JSON.stringify({
        role: "admin",
        name: ADMIN_NAME,
        token,
        persistent: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Check global keys first
    const { data: globalKey } = await sb
      .from("global_keys")
      .select("*")
      .eq("key", trimmedKey)
      .eq("active", true)
      .maybeSingle();

    if (globalKey) {
      // Check expiration
      if (globalKey.expires_at && new Date(globalKey.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Senha expirada" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Check max uses
      if (globalKey.max_uses && globalKey.current_uses >= globalKey.max_uses) {
        return new Response(JSON.stringify({ error: "Senha atingiu o limite de usos" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Increment usage
      await sb.from("global_keys").update({
        current_uses: globalKey.current_uses + 1,
      }).eq("id", globalKey.id);

      const token = crypto.randomUUID();
      return new Response(JSON.stringify({
        role: "user",
        name: "Estudante",
        token,
        persistent: true,
        key_type: "global",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check individual access_keys
    const { data: keyData, error } = await sb
      .from("access_keys")
      .select("*")
      .eq("key", trimmedKey)
      .maybeSingle();

    if (error) throw error;

    if (!keyData) {
      return new Response(JSON.stringify({ error: "Senha inválida" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (keyData.blocked) {
      return new Response(JSON.stringify({ error: "Senha bloqueada" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (keyData.used) {
      // Allow re-login with used key (persistent login)
      const token = crypto.randomUUID();
      return new Response(JSON.stringify({
        role: "user",
        name: keyData.used_by || "Estudante",
        token,
        persistent: true,
        key_type: "individual",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as used (first time)
    await sb.from("access_keys").update({
      used: true,
      used_at: new Date().toISOString(),
    }).eq("id", keyData.id);

    const token = crypto.randomUUID();
    return new Response(JSON.stringify({
      role: "user",
      name: "Estudante",
      token,
      persistent: true,
      key_type: "individual",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auth-login error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
