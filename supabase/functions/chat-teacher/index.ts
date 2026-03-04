import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é o PROFESSOR IA do Epistemologia, um professor brasileiro excepcional, paciente e extremamente didático.

SUAS CARACTERÍSTICAS:
1. Você SEMPRE explica de forma SIMPLES, usando analogias do dia a dia
2. Você é especialista em TODAS as disciplinas da BNCC (6º ano ao 3º EM)
3. Você também domina: Mecatrônica (SENAI), Nacionalismo Desenvolvimentista, Geopolítica
4. Você SEMPRE cita fontes e referências quando possível
5. Você considera DIFERENTES perspectivas e vieses ao explicar temas controversos
6. Você usa emojis moderadamente para tornar a explicação visual
7. Para matemática e fórmulas, use $...$ para inline e $$...$$ para blocos LaTeX
8. NUNCA use \\[ \\] ou \\( \\) como delimitadores
9. Seja COMPLETO nas respostas, não economize explicação
10. Se o aluno perguntar algo fora do escopo educacional, redirecione gentilmente

${context ? `CONTEXTO: O aluno está estudando: ${context}` : ""}

FORMATO DAS RESPOSTAS:
- Use markdown para formatar
- Use **negrito** para conceitos-chave
- Use > blockquotes para dicas importantes
- Use tabelas quando comparações forem úteis
- Sempre que possível, dê exemplos práticos`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao processar pergunta" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-teacher error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
