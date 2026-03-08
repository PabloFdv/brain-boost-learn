import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { grade, subject, topic, numQuestions } = await req.json();
    const questionsCount = numQuestions || 5;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Determine subject type for better prompting
    const humanitiesSubjects = ["historia", "geografia", "filosofia", "sociologia", "portugues"];
    const mathSubjects = ["matematica", "fisica", "quimica"];
    const technicalSubjects = ["automacao", "dev-sistemas", "mecatronica", "mecanica", "edificacoes", "eletromec", "iot"];
    
    const isHumanities = humanitiesSubjects.includes(subject);
    const isMath = mathSubjects.includes(subject);
    const isTechnical = technicalSubjects.includes(subject);

    let subjectInstructions = "";
    if (isHumanities) {
      subjectInstructions = `
INSTRUÇÕES ESPECIAIS PARA HUMANAS:
- Crie questões no estilo ENEM/vestibular com enunciados contextualizados
- Use trechos de textos, imagens mentais, ou situações históricas reais
- Inclua questões de análise, interpretação e relação entre conceitos
- Evite questões de pura memorização - priorize raciocínio crítico
- Para História: use fontes primárias simuladas, contextos sociopolíticos
- Para Geografia: use dados, mapas conceituais, situações-problema
- Para Filosofia/Sociologia: apresente dilemas éticos, pensadores e suas ideias
- Para Português: use textos literários, análise gramatical em contexto`;
    } else if (isMath) {
      subjectInstructions = `
INSTRUÇÕES ESPECIAIS PARA EXATAS:
- NUNCA duplique fórmulas: se usar notação matemática, não repita em texto corrido
- Use notação clara: frações como a/b, potências como x², raízes como √x
- Para cálculos, mostre apenas o enunciado claro, sem passo a passo no enunciado
- Inclua questões de aplicação prática (problemas do cotidiano)
- Alternativas erradas devem ser erros comuns de cálculo (plausíveis)
- Varie entre questões conceituais e de cálculo`;
    } else if (isTechnical) {
      subjectInstructions = `
INSTRUÇÕES ESPECIAIS PARA DISCIPLINAS TÉCNICAS (FIRJAN SENAI):
- Questões devem refletir o currículo técnico profissionalizante
- Inclua normas técnicas (NRs, NBRs) quando relevante
- Use terminologia técnica correta da área
- Misture teoria com situações práticas de trabalho
- Adeque ao nível: 1º ano (básico), 2º ano (intermediário), 3º ano (avançado)`;
    }

    const systemPrompt = `Você é um professor brasileiro experiente que cria exercícios de múltipla escolha para simulados no estilo ENEM e vestibulares.

REGRAS OBRIGATÓRIAS:
1. Crie exatamente ${questionsCount} questões sobre o tema "${topic}"
2. Cada questão deve ter exatamente 4 alternativas
3. As questões devem cobrir diferentes aspectos do tema com PROFUNDIDADE
4. As alternativas erradas devem ser plausíveis e baseadas em erros comuns
5. A explicação deve ser clara, didática e agregar conhecimento
6. Adeque a dificuldade ao nível: ${grade}
7. Questões devem ser no formato prova/simulado, NÃO triviais
8. Enunciados devem ser bem elaborados, com contexto quando possível
${subjectInstructions}

FORMATAÇÃO:
- NÃO use LaTeX ou $ nos enunciados ou alternativas
- Use texto puro para fórmulas simples: x², √x, a/b
- Use subscrito textual: H₂O, CO₂ (caracteres Unicode)
- Mantenha enunciados claros e sem ambiguidade`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Crie ${questionsCount} exercícios de múltipla escolha de alta qualidade sobre "${topic}" para ${grade}, disciplina de ${subject}. Cada questão deve ser elaborada como uma questão de prova real, com enunciados contextualizados e alternativas plausíveis.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_exercises",
              description: "Retorna exercícios de múltipla escolha formatados para simulado",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "Enunciado contextualizado da questão (sem LaTeX, use Unicode para fórmulas)" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          description: "Exatamente 4 alternativas (sem LaTeX)",
                        },
                        correct: { type: "number", description: "Índice da alternativa correta (0-3)" },
                        explanation: { type: "string", description: "Explicação didática e detalhada da resposta correta" },
                      },
                      required: ["question", "options", "correct", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_exercises" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente." }), {
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
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    // Post-process: ensure correct is the text of the correct option for consistency
    if (result.questions) {
      result.questions = result.questions.map((q: any) => {
        // Convert index-based correct to text-based for frontend compatibility
        if (typeof q.correct === "number" && q.options && q.options[q.correct]) {
          q.correctAnswer = q.options[q.correct];
          q.correct = q.options[q.correct];
        }
        return q;
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-exercises error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
