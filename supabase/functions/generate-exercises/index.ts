import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { grade, subject, topic, numQuestions, mode } = await req.json();
    const questionsCount = numQuestions || 5;
    const isChallenge = mode === "challenge"; // fast mode for 30s challenge / battle
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const humanitiesSubjects = ["historia", "geografia", "filosofia", "sociologia", "portugues", "arte"];
    const mathSubjects = ["matematica", "fisica", "quimica", "logica"];
    const bioSubjects = ["ciencias", "biologia"];
    const technicalSubjects = ["automacao", "dev-sistemas", "mecatronica", "mecanica", "edificacoes", "eletromec", "iot"];
    const englishSubjects = ["ingles"];

    const isHumanities = humanitiesSubjects.includes(subject);
    const isMath = mathSubjects.includes(subject);
    const isTechnical = technicalSubjects.includes(subject);
    const isBio = bioSubjects.includes(subject);
    const isEnglish = englishSubjects.includes(subject);

    // Grade level mapping for curriculum alignment
    const gradeMap: Record<string, string> = {
      "6ano": "6º ano do Ensino Fundamental (11-12 anos)",
      "7ano": "7º ano do Ensino Fundamental (12-13 anos)",
      "8ano": "8º ano do Ensino Fundamental (13-14 anos)",
      "9ano": "9º ano do Ensino Fundamental (14-15 anos)",
      "1em": "1º ano do Ensino Médio (15-16 anos)",
      "2em": "2º ano do Ensino Médio (16-17 anos)",
      "3em": "3º ano do Ensino Médio / Pré-vestibular (17-18 anos)",
    };
    const gradeName = gradeMap[grade] || grade;

    // Curriculum topics per grade/subject for variety
    const curriculumContext = getCurriculumContext(grade, subject);

    let subjectInstructions = "";
    if (isHumanities) {
      subjectInstructions = `
INSTRUÇÕES PARA HUMANAS (ESTILO ENEM/VESTIBULAR):
- SEMPRE use enunciados contextualizados com texto-base, dados históricos ou situação-problema
- Para História: cite datas, personagens reais, contexto sociopolítico, fontes primárias simuladas
- Para Geografia: use dados, mapas conceituais, questões ambientais, geopolítica, urbanização
- Para Filosofia: apresente dilemas éticos, falas de filósofos, correntes filosóficas
- Para Sociologia: use conceitos de autores clássicos (Weber, Durkheim, Marx), análise social
- Para Português: use textos literários reais ou simulados, análise gramatical em contexto, interpretação
- Alterne entre: análise de texto, relação causa-consequência, comparação de períodos, interpretação de dados
- Evite questões de pura memorização; priorize raciocínio crítico e contextualização
- Alternativas erradas devem ser plausíveis (confusão entre períodos/conceitos similares)`;
    } else if (isMath) {
      subjectInstructions = `
INSTRUÇÕES PARA EXATAS (MATEMÁTICA/FÍSICA/QUÍMICA/LÓGICA):
- Use notação Unicode limpa: x², √x, π, ÷, ×, ≤, ≥, ∞, Δ
- NÃO use LaTeX ($...$); escreva fórmulas em texto puro
- Para Matemática: misture álgebra, geometria, aritmética, estatística, funções, progressões
- Para Física: use situações do cotidiano (movimento, energia, circuitos, ondas, termodinâmica)
- Para Química: use reações balanceadas em texto, tabela periódica, estequiometria
- Inclua SEMPRE o enunciado-problema com contexto real (não apenas "calcule x")
- Alternativas erradas = erros de cálculo comuns (trocar sinal, erro de divisão, confundir fórmula)
- Varie entre questões conceituais (40%) e de cálculo aplicado (60%)`;
    } else if (isTechnical) {
      subjectInstructions = `
INSTRUÇÕES PARA DISCIPLINAS TÉCNICAS FIRJAN SENAI:
- Alinhe ao currículo técnico profissionalizante FIRJAN SENAI
- Cite normas técnicas relevantes: NRs (segurança), NBRs (normas), IEEE, IEC quando aplicável
- Use terminologia técnica correta e atual da área
- Misture: teoria (30%) + situações práticas de trabalho (50%) + segurança/normas (20%)
- Para Automação: CLP, sensores, atuadores, lógica de controle, pneumática, hidráulica
- Para Dev. Sistemas: algoritmos, linguagens, banco de dados, desenvolvimento web/mobile, POO
- Para Mecatrônica: sistemas integrados, servo-motores, encoder, comunicação industrial
- Para Mecânica: resistência de materiais, processos de usinagem, metrologia, mecanismos
- Para Edificações: topografia, estruturas, instalações prediais, normas de construção civil
- Para Eletromecânica: motores elétricos, comandos elétricos, inversores de frequência
- Para IoT: protocolos MQTT/HTTP, microcontroladores, cloud, sensores inteligentes
- Adeque dificuldade: 1º ano (conceitos básicos), 2º ano (aplicação), 3º ano (projeto/avançado)`;
    } else if (isBio) {
      subjectInstructions = `
INSTRUÇÕES PARA BIOLOGIA/CIÊNCIAS:
- Use contexto científico real (pesquisas, descobertas, problemas ambientais)
- Para Biologia: genética, evolução, ecologia, fisiologia, citologia, botânica, zoologia
- Para Ciências (EF): corpo humano, ecossistemas, matéria e energia, universo, ser vivo
- Inclua questões com dados (tabelas, gráficos descritos em texto) quando possível
- Alterne entre questões conceituais e de aplicação/interpretação
- Use terminologia científica adequada ao nível`;
    } else if (isEnglish) {
      subjectInstructions = `
INSTRUÇÕES PARA INGLÊS:
- Use textos curtos (80-150 palavras) como base para algumas questões de interpretação
- Misture: gramática em contexto, vocabulário temático, interpretação de texto, produção textual
- Adeque ao nível: ${gradeName}
- Para EF: vocabulário básico, present/past tense, pronomes, preposições comuns
- Para EM: tempos verbais complexos, voz passiva, condicional, phrasal verbs, leitura crítica
- Alternativas com erros gramaticais comuns de falantes de português`;
    }

    const varietyInstruction = `
GARANTIA DE VARIEDADE (OBRIGATÓRIO):
- As questões devem cobrir DIFERENTES tópicos do currículo de ${gradeName} para ${subject}
- Currículo de referência para essa combinação: ${curriculumContext}
- Escolha aleatoriamente entre os tópicos listados para máxima variedade
- NUNCA repita o mesmo conceito em duas questões diferentes
- Cada questão deve testar um aspecto DIFERENTE do conteúdo`;

    const difficultyInstruction = isChallenge
      ? `MODO DESAFIO/BATALHA: Questões mais diretas e rápidas de ler (máx. 2 linhas no enunciado). Alternativas curtas. Foco em conceitos essenciais do currículo.`
      : `MODO SIMULADO: Questões elaboradas com enunciado contextualizado (3-6 linhas). Estilo ENEM/vestibular. Alternativas completas e plausíveis.`;

    const systemPrompt = `Você é um professor brasileiro especialista que cria exercícios alinhados à BNCC para simulados e avaliações escolares.

REGRAS ABSOLUTAS:
1. Crie exatamente ${questionsCount} questões sobre "${topic}" para ${gradeName}
2. Cada questão deve ter EXATAMENTE 4 alternativas (A, B, C, D)
3. Todas as questões devem ser estritamente adequadas ao nível ${gradeName}
4. A explicação deve ser DETALHADA (3-5 linhas), didática, e ensinar o conceito
5. As alternativas erradas devem ser plausíveis (erros pedagógicos comuns)
6. NÃO use LaTeX, $ ou \\ em nenhum campo — apenas texto puro e Unicode

${difficultyInstruction}
${varietyInstruction}
${subjectInstructions}`;

    const userContent = isChallenge
      ? `Crie ${questionsCount} questões rápidas e variadas de ${subject} para ${gradeName}, cobrindo diferentes tópicos do currículo. Inclua explicação didática em cada uma.`
      : `Crie ${questionsCount} questões elaboradas no estilo ENEM/vestibular de ${subject} para ${gradeName}, sobre o tema "${topic}". Cada questão deve ser um desafio pedagógico real com contexto, enunciado bem desenvolvido e explicação completa.`;

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
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_exercises",
              description: "Retorna exercícios de múltipla escolha formatados",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: {
                          type: "string",
                          description: "Enunciado completo e contextualizado da questão (sem LaTeX, use Unicode)",
                        },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          description: "Exatamente 4 alternativas plausíveis (sem LaTeX)",
                        },
                        correct: {
                          type: "number",
                          description: "Índice (0-3) da alternativa correta",
                        },
                        explanation: {
                          type: "string",
                          description: "Explicação pedagógica detalhada (3-5 linhas) que ensina o conceito correto e explica por que as outras alternativas estão erradas",
                        },
                        topic_tag: {
                          type: "string",
                          description: "Tópico curricular específico dessa questão (ex: 'Equações do 1º grau', 'Revolução Francesa')",
                        },
                      },
                      required: ["question", "options", "correct", "explanation", "topic_tag"],
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
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes. Contate o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    // Post-process: normalize correct answer to text for frontend compatibility
    if (result.questions) {
      result.questions = result.questions.map((q: any) => {
        if (typeof q.correct === "number" && q.options && q.options[q.correct] !== undefined) {
          q.correctAnswer = q.options[q.correct];
          q.correct = q.options[q.correct]; // text form
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

// Curriculum context for variety — ensures AI picks diverse topics per grade/subject
function getCurriculumContext(grade: string, subject: string): string {
  const curriculum: Record<string, Record<string, string>> = {
    matematica: {
      "6ano": "Números naturais, divisibilidade, MMC/MDC, frações, decimais, porcentagem, geometria básica, área e perímetro, introdução a inteiros",
      "7ano": "Inteiros, racionais, expressões algébricas, equações 1º grau, proporcionalidade, porcentagem avançada, geometria plana, ângulos, triângulos",
      "8ano": "Sistemas lineares, produtos notáveis, fatoração, teorema de Pitágoras, trigonometria básica, semelhança, estatística básica, potências e raízes",
      "9ano": "Funções afim e quadrática, equação 2º grau (Bhaskara), PA e PG, geometria espacial (prismas, pirâmides), trigonometria, probabilidade básica",
      "1em": "Conjuntos, funções (afim, quadrática, modular), equações, inequações, análise combinatória, probabilidade, matrizes introdução",
      "2em": "Trigonometria completa, funções exponencial e logarítmica, progressões, matrizes e determinantes, geometria analítica, estatística",
      "3em": "Geometria analítica completa, números complexos, polinômios, derivadas introdução, integrais introdução, estatística avançada, revisão ENEM",
    },
    historia: {
      "6ano": "Pré-história, civilizações antigas (Egito, Mesopotâmia, Grécia, Roma), fontes históricas, tempo histórico, Antiguidade Oriental e Ocidental",
      "7ano": "Feudalismo, Idade Média, Cruzadas, Renascimento, grandes navegações, conquista da América, Reformas Religiosas, Absolutismo",
      "8ano": "Colonização brasileira, escravidão africana, Iluminismo, Revoluções (Francesa, Industrial, Americana), Independência do Brasil, Primeiro Reinado",
      "9ano": "Segundo Reinado, abolição escravatura, República Velha, Primeira Guerra Mundial, Era Vargas, Segunda Guerra, Guerra Fria, ditadura militar",
      "1em": "Antiguidade Clássica avançada, Medieval, Moderna: Renascimento, absolutismo, mercantilismo, colonialismo, Reformas Protestantes",
      "2em": "Revoluções Burguesas, Imperialismo, Primeira Guerra, Entreguerras, Segunda Guerra, Guerra Fria, Descolonização, Movimentos sociais do século XX",
      "3em": "Brasil Contemporâneo, globalização, neoliberalismo, redemocratização, conflitos atuais, geopolítica contemporânea, revisão ENEM",
    },
    portugues: {
      "6ano": "Tipos textuais, gêneros textuais, ortografia, sílabas, acentuação básica, classes gramaticais básicas (substantivo, verbo, adjetivo), pontuação",
      "7ano": "Análise sintática (sujeito, predicado), concordância básica, adjuntos, interpretação textual, figuras de linguagem, texto narrativo e descritivo",
      "8ano": "Análise sintática completa, regência básica, crase, tempos verbais, coesão e coerência, texto argumentativo, literatura brasileira início",
      "9ano": "Período composto (coordenação, subordinação), regência verbal e nominal, Literatura (Trovadorismo, Classicismo, Quinhentismo), produção textual dissertativa",
      "1em": "Literatura (Barroco, Arcadismo), análise de texto literário, dissertação argumentativa, vícios de linguagem, variação linguística",
      "2em": "Romantismo, Realismo/Naturalismo, Parnasianismo, Simbolismo, análise crítica de obras, argumentação avançada, linguística",
      "3em": "Modernismo completo, contemporaneidade literária, redação ENEM (estrutura, competências), análise de obras, gramática para vestibular",
    },
    fisica: {
      "6ano": "Introdução às ciências, medidas, instrumentos de medição (parte de Ciências)",
      "7ano": "Introdução física (parte de Ciências): luz, som, calor básico",
      "8ano": "Cinemática básica, óptica geométrica, ondas, eletricidade básica",
      "9ano": "Mecânica: MRU, MRUV, força, Newton, energia, trabalho, potência, campo elétrico básico",
      "1em": "Cinemática completa, dinâmica (Leis de Newton), trabalho e energia, gravitação universal, hidrostática",
      "2em": "Termodinâmica, ondulatória, óptica geométrica completa, eletrostática, eletrodinâmica",
      "3em": "Eletromagnetismo, física moderna (relatividade, quântica), física nuclear, revisão ENEM/vestibular",
    },
    quimica: {
      "6ano": "Misturas, separação de misturas (parte de Ciências)",
      "7ano": "Materiais e propriedades, reações simples (parte de Ciências)",
      "8ano": "Tabela periódica introdução, ligações químicas básicas, ácidos e bases básico",
      "9ano": "Tabela periódica completa, ligações iônicas/covalentes/metálicas, reações químicas, balanceamento, soluções",
      "1em": "Estequiometria, soluções, termoquímica, cinética química introdução, equilíbrio químico básico",
      "2em": "Eletroquímica, funções inorgânicas completas, equilíbrio iônico, radioatividade, química analítica",
      "3em": "Química orgânica completa (hidrocarbonetos, funções, reações), polímeros, ambiental, revisão ENEM",
    },
    biologia: {
      "6ano": "Seres vivos, ecossistemas, cadeia alimentar, corpo humano básico (parte de Ciências)",
      "7ano": "Classificação dos seres vivos, invertebrados, vertebrados, fungi, protistas (parte de Ciências)",
      "8ano": "Citologia básica, fisiologia humana (digestão, respiração, circulação), saúde e doenças",
      "9ano": "Genética mendeliana, evolução (Darwin, Lamarck), ecologia, biogeografia, classificação taxonômica",
      "1em": "Citologia completa, histologia, embriologia, diversidade dos seres vivos, ecologia básica",
      "2em": "Fisiologia humana completa, genética molecular, evolução, imunologia, biotecnologia",
      "3em": "Ecologia avançada, genética de populações, evolução avançada, revisão ENEM, botânica completa",
    },
    ciencias: {
      "6ano": "Universo e Sistema Solar, Terra e seus movimentos, matéria e energia, misturas e substâncias, ecossistemas, seres vivos, corpo humano básico",
      "7ano": "Vida e evolução, células, organismos, ecossistemas, diversidade de seres vivos, saúde humana, física e química básica",
      "8ano": "Física: movimento, energia, luz e som; Química: substâncias, reações; Biologia: reprodução, hereditariedade; Corpo humano avançado",
      "9ano": "Física: eletricidade, magnetismo, radioatividade; Química: orgânica básica; Biologia: genética, evolução; Tecnologia e ciência",
    },
    geografia: {
      "6ano": "Cartografia, orientação, coordenadas geográficas, relevo, clima, hidrografia, biomas brasileiros, urbanização básica",
      "7ano": "Continentes: África e América; desertificação, recursos naturais, questões ambientais, geopolítica básica, movimentos populacionais",
      "8ano": "Europa e Ásia: geopolítica, economia, cultura; globalização, tecnologia, conflitos mundiais, questões demográficas",
      "9ano": "Geopolítica mundial, blocos econômicos, Brasil: regiões, desenvolvimento econômico, problemas socioambientais, cartografia avançada",
      "1em": "Cartografia avançada, climatologia, geomorfologia, hidrologia, biogeografia, dinâmica populacional, urbanização",
      "2em": "Geopolítica regional e mundial, geoeconomia, recursos naturais, problemas ambientais globais, movimentos sociais, geopolítica brasileira",
      "3em": "Globalização avançada, neoliberalismo, geopolítica contemporânea, questões ambientais, Brasil no mundo, revisão ENEM",
    },
    filosofia: {
      "1em": "Origem da filosofia, pré-socráticos, Sócrates, Platão, Aristóteles, epistemologia grega, ética antiga",
      "2em": "Filosofia Medieval (Agostinho, Tomás de Aquino), Renascimento, Descartes, empirismo, iluminismo, Kant",
      "3em": "Filosofia contemporânea: Hegel, Marx, Nietzsche, existencialismo, filosofia analítica, ética aplicada, revisão",
    },
    sociologia: {
      "1em": "Origem da sociologia, Auguste Comte, Spencer, Durkheim (fato social, solidariedade), Marx (classes, alienação), métodos sociológicos",
      "2em": "Weber (ação social, burocracia), movimentos sociais, estrutura social, poder e dominação, cultura e identidade, globalização",
      "3em": "Cultura, identidade, desigualdades sociais, democracia, política contemporânea, sociologia brasileira, revisão ENEM",
    },
    ingles: {
      "6ano": "Saudações, família, números, cores, animais, presente simples (be/have), preposições básicas, vocabulário escolar",
      "7ano": "Present simple/continuous, there is/are, preposições de lugar, vocabulário de rotinas, texto instrucional básico",
      "8ano": "Past simple, futuro (will/going to), comparativos e superlativos, vocabulário de viagem, interpretação de texto",
      "9ano": "Present perfect, modal verbs, voz passiva introdução, phrasal verbs básicos, leitura e interpretação avançada",
      "1em": "Tempos verbais completos, voz passiva, condicional, leitura crítica, vocabulário acadêmico, inglês para comunicação",
      "2em": "Reported speech, perfeitos avançados, inversão, leitura de textos científicos e literários, produção textual",
      "3em": "Revisão gramatical completa, interpretação ENEM, vocabulário avançado, inglês instrumental, textos complexos",
    },
    logica: {
      "6ano": "Sequências numéricas, padrões, operações básicas, raciocínio espacial básico, problemas lógicos simples",
      "7ano": "Proporção, porcentagem, raciocínio lógico-matemático, problemas de lógica, diagramas de Venn básico",
      "8ano": "Lógica proposicional básica, verdadeiro/falso, raciocínio dedutivo, sequências complexas, problemas de combinatória",
      "9ano": "Lógica proposicional, tabela-verdade, quantificadores, raciocínio indutivo/dedutivo, análise combinatória",
      "1em": "Lógica formal, tabela-verdade, implicação, equivalência, análise combinatória, probabilidade, raciocínio crítico",
      "2em": "Lógica matemática avançada, conjuntos, relações, funções lógicas, raciocínio analítico, problemas complexos",
      "3em": "Raciocínio lógico-quantitativo ENEM/concursos, análise combinatória avançada, probabilidade, otimização",
    },
    automacao: {
      "1em": "Introdução à automação industrial, CLP básico, sensores e atuadores básicos, segurança NR-12, pneumática básica, lógica ladder",
      "2em": "Programação CLP avançada, redes industriais (Profibus, Ethernet/IP), sistemas SCADA, hidráulica industrial, IHM",
      "3em": "Integração de sistemas, robótica industrial, Industry 4.0, manutenção preditiva, projetos de automação, NRs avançadas",
    },
    "dev-sistemas": {
      "1em": "Algoritmos e lógica de programação, pseudocódigo, fluxogramas, introdução a Python/JavaScript, HTML/CSS básico, estruturas de dados básicas",
      "2em": "POO, banco de dados SQL, desenvolvimento web front-end avançado, back-end básico, controle de versão Git, metodologias ágeis",
      "3em": "APIs REST, banco de dados NoSQL, segurança em aplicações, cloud computing, DevOps básico, projeto integrador, mobile básico",
    },
    mecatronica: {
      "1em": "Eletrônica básica (circuitos, componentes), microcontroladores (Arduino), sensores básicos, programação básica para hardware, mecânica básica",
      "2em": "Sistemas de controle, servomotores, encoders, comunicação serial/I2C/SPI, visão computacional básica, projetos integrados",
      "3em": "Robótica avançada, sistemas embarcados, FPGA básico, controle PID, integração mecânica-elétrica-software, projetos avançados",
    },
    mecanica: {
      "1em": "Metrologia dimensional, materiais de construção mecânica, ferramentas manuais, processos de usinagem básico, segurança NR-12, desenho técnico",
      "2em": "Resistência de materiais, processos de fabricação (soldagem, usinagem CNC), mecanismos, lubrificação, manutenção industrial",
      "3em": "Projeto de máquinas, processos especiais (estampagem, fundição), controle de qualidade, CAD/CAM básico, planejamento de manutenção",
    },
    edificacoes: {
      "1em": "Desenho técnico arquitetônico, materiais de construção, topografia básica, segurança na construção (NR-18), instalações básicas",
      "2em": "Estruturas (concreto, aço, madeira), instalações elétricas e hidráulicas prediais, orçamento básico, gerenciamento de obras",
      "3em": "Projetos completos, sustentabilidade na construção, NBRs avançadas, BIM básico, patologias das construções, licitações",
    },
    eletromec: {
      "1em": "Eletricidade básica (Ohm, Kirchhoff), circuitos elétricos, motores elétricos CC, transformadores, segurança elétrica NR-10",
      "2em": "Motores CA (monofásico e trifásico), comandos elétricos, inversores de frequência, instalações industriais, manutenção elétrica",
      "3em": "Sistemas elétricos industriais, eficiência energética, energias renováveis, automação de painéis, projetos elétricos, NRs avançadas",
    },
    iot: {
      "1em": "Conceitos IoT, protocolos básicos (HTTP, MQTT), microcontroladores (Arduino/ESP), sensores básicos, conectividade Wi-Fi/Bluetooth",
      "2em": "Cloud computing para IoT, banco de dados IoT, segurança em dispositivos, análise de dados básica, dashboards, projetos práticos",
      "3em": "Edge computing, Machine Learning para IoT, infraestrutura industrial (IIoT), protocolos avançados (LoRa, Zigbee), projetos avançados",
    },
    arte: {
      "6ano": "Elementos visuais (linha, cor, forma, textura), artes plásticas, movimentos artísticos básicos, arte brasileira, música e teatro básico",
      "7ano": "História da arte (pré-história ao Renascimento), arte africana e indígena, linguagens artísticas, produção cultural",
      "8ano": "Arte moderna (impressionismo ao surrealismo), arte brasileira modernista, fotografia, cinema, design gráfico básico",
      "9ano": "Arte contemporânea, street art, arte digital, movimentos artísticos brasileiros, crítica e apreciação estética",
      "1em": "Arte e sociedade, vanguardas europeias, modernismo brasileiro, semana de 22, fotografia e cinema como arte",
      "2em": "Arte contemporânea global, performance, instalação, arte conceitual, indústria cultural, comunicação e mídia",
      "3em": "Arte e tecnologia, arte digital, curadoria, mercado de arte, patrimônio cultural, revisão histórica",
    },
    "educacao-fisica": {
      "6ano": "Jogos pré-desportivos, habilidades motoras fundamentais, regras do futsal e voleibol, ginástica artística básica, saúde e alimentação",
      "7ano": "Esportes coletivos (futsal, voleibol, basquete), atletismo básico, ginástica rítmica, capacidades físicas, higiene e saúde",
      "8ano": "Esportes de rede (vôlei, badminton), táticas de jogos coletivos, atividade física e qualidade de vida, primeiros socorros",
      "9ano": "Esportes de combate (judô, capoeira), jogos populares e de matriz africana e indígena, fisiologia do exercício básica",
      "1em": "Sistemas energéticos, treinamento físico, esportes avançados, cultura corporal de movimento, doping e ética no esporte",
      "2em": "Esportes de aventura, ginástica de academia, saúde coletiva, mídia e esporte, corpo e sociedade",
      "3em": "Lazer e qualidade de vida, profissões do esporte, avaliação física, cultura corporal brasileira",
    },
  };

  return curriculum[subject]?.[grade] ||
    `Conteúdo curricular de ${subject} para ${grade} — gere questões variadas cobrindo os principais tópicos da disciplina para este ano`;
}
