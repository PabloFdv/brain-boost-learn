import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PASSWORD = "240619PPM";

function generateKey(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, adminKey, keyId, label, expiresAt, maxUses, keyValue } = body;

    if (adminKey !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case "list": {
        const { data: keys } = await sb.from("access_keys").select("*").order("created_at", { ascending: false });
        const { data: globalKeys } = await sb.from("global_keys").select("*").order("created_at", { ascending: false });
        return new Response(JSON.stringify({ keys: keys || [], globalKeys: globalKeys || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "generate": {
        const newKey = generateKey();
        const { data, error } = await sb.from("access_keys")
          .insert({ key: newKey, created_by: "Pablo Martins Santana" })
          .select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ key: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "generate_global": {
        const gKey = keyValue || generateKey(10);
        const insert: any = {
          key: gKey,
          label: label || "Key Global",
          created_by: "Pablo Martins Santana",
        };
        if (expiresAt) insert.expires_at = expiresAt;
        if (maxUses) insert.max_uses = maxUses;
        const { data, error } = await sb.from("global_keys").insert(insert).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ globalKey: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "toggle_global": {
        if (!keyId) throw new Error("keyId required");
        const { data: existing } = await sb.from("global_keys").select("active").eq("id", keyId).single();
        if (!existing) throw new Error("Key not found");
        await sb.from("global_keys").update({ active: !existing.active }).eq("id", keyId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_global": {
        if (!keyId) throw new Error("keyId required");
        await sb.from("global_keys").delete().eq("id", keyId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "block": {
        if (!keyId) throw new Error("keyId required");
        await sb.from("access_keys").update({ blocked: true }).eq("id", keyId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "unblock": {
        if (!keyId) throw new Error("keyId required");
        await sb.from("access_keys").update({ blocked: false }).eq("id", keyId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        if (!keyId) throw new Error("keyId required");
        await sb.from("access_keys").delete().eq("id", keyId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reset": {
        if (!keyId) throw new Error("keyId required");
        await sb.from("access_keys").update({ used: false, used_at: null, used_by: null }).eq("id", keyId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("admin-keys error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
