import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { grade, subject, topic, gradeId, subjectId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um professor brasileiro EXCEPCIONAL, especialista em tornar qualquer assunto fácil de entender. Você cria aulas extremamente didáticas seguindo a BNCC.

REGRAS OBRIGATÓRIAS para criar a aula:
1. Use linguagem SIMPLES e acessível para o nível do aluno (${grade})
2. SEMPRE comece com uma analogia do dia a dia para introduzir o conceito
3. Use emojis moderadamente para tornar o texto mais visual (🔍 📌 💡 ⚡ 🎯)
4. Organize com títulos claros usando ## e ###
5. Inclua exemplos PRÁTICOS e do cotidiano do aluno
6. Use **negrito** para conceitos-chave
7. Use > blockquotes para dicas importantes e analogias
8. REGRAS DE MATEMÁTICA E FÓRMULAS (IMPORTANTÍSSIMO - SIGA À RISCA):
   - TODA fórmula DEVE estar entre delimitadores LaTeX COMPLETOS e FECHADOS
   - Inline: $formula$ (SEMPRE abrir E fechar com $)
   - Bloco: $$formula$$ em linhas separadas
   - NUNCA deixe um $ aberto sem fechar
   - NUNCA use $ para indicar moeda ou qualquer outro propósito que não seja LaTeX
   - NUNCA escreva coisas como "$x^2 - 5x + 6 = 0." com ponto dentro ou fora quebrando o $
   - CORRETO: a equação $x^2 - 5x + 6 = 0$ tem duas raízes
   - ERRADO: a equação $x^2 - 5x + 6 = 0. tem duas raízes
   - NUNCA use \\[ \\] ou \\( \\) como delimitadores
   - NUNCA use caracteres Unicode de math (𝑥, 𝑏, Δ etc) - SEMPRE use LaTeX: $x$, $b$, $\\Delta$
   - Use \\text{} para texto dentro de fórmulas: $v = \\frac{\\Delta s}{\\Delta t} \\text{ (em m/s)}$
   - Use \\cdot para multiplicação, não *
   - Sempre que citar uma fórmula, explique cada variável
   - REGRA DE OURO: Se você escreve um $, OBRIGATORIAMENTE escreva outro $ para fechar
9. Crie tabelas comparativas quando útil
10. Termine com um resumo tipo "mapa mental" em tópicos
11. Seja COMPLETO e EXTENSO - cubra ABSOLUTAMENTE todo o conteúdo necessário para a série
12. Use analogias criativas: compare conceitos com coisas do dia a dia (apps, jogos, redes sociais, etc.)
13. Mantenha parágrafos curtos e escaneáveis
14. A aula deve ser LONGA e DETALHADA - pelo menos 2000 palavras

ESTRUTURA DA AULA:
## 🎯 Introdução (analogia do dia a dia)
## 📖 Conceitos Fundamentais
## 🔍 Aprofundando (com muitos exemplos resolvidos passo a passo)
## 💡 Analogias e Dicas
## 📊 Resumo Visual (tabelas quando aplicável)
## 📝 Resumo Final (tópicos-chave para revisão)`;

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
          {
            role: "user",
            content: `Crie uma aula completa e super didática sobre "${topic}" para ${grade}, disciplina de ${subject}. Siga todas as regras do sistema.`,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
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
      return new Response(JSON.stringify({ error: "Erro ao gerar aula" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // We'll also save the full content to cache after streaming completes
    // For that we need to tee the stream
    const [streamForClient, streamForCache] = response.body!.tee();

    // Save to cache in background
    const cachePromise = (async () => {
      try {
        const reader = streamForCache.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullContent += content;
            } catch {}
          }
        }

        if (fullContent.length > 100) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const sb = createClient(supabaseUrl, supabaseKey);
          await sb.from("lessons").upsert({
            grade: gradeId,
            subject: subjectId,
            topic,
            content: fullContent,
          }, { onConflict: "grade,subject,topic" });
        }
      } catch (e) {
        console.error("Cache save error:", e);
      }
    })();

    // Don't await the cache promise - let it run in background
    EdgeRuntime?.waitUntil?.(cachePromise);

    return new Response(streamForClient, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-lesson error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
