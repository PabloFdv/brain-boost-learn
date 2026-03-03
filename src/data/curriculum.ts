export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Grade {
  id: string;
  name: string;
  level: string;
  subjects: Subject[];
  topics: Record<string, string[]>;
}

const commonSubjects: Subject[] = [
  { id: "portugues", name: "Língua Portuguesa", icon: "📖", color: "221 83% 53%" },
  { id: "matematica", name: "Matemática", icon: "📐", color: "250 70% 56%" },
  { id: "ciencias", name: "Ciências", icon: "🔬", color: "142 71% 45%" },
  { id: "historia", name: "História", icon: "🏛️", color: "36 100% 50%" },
  { id: "geografia", name: "Geografia", icon: "🌍", color: "160 60% 45%" },
  { id: "ingles", name: "Inglês", icon: "🇬🇧", color: "0 84% 60%" },
  { id: "arte", name: "Arte", icon: "🎨", color: "280 60% 50%" },
  { id: "educacao-fisica", name: "Educação Física", icon: "⚽", color: "25 95% 53%" },
  { id: "ensino-religioso", name: "Ensino Religioso", icon: "🕊️", color: "45 93% 47%" },
];

const emSubjects: Subject[] = [
  { id: "portugues", name: "Língua Portuguesa", icon: "📖", color: "221 83% 53%" },
  { id: "matematica", name: "Matemática", icon: "📐", color: "250 70% 56%" },
  { id: "fisica", name: "Física", icon: "⚡", color: "36 100% 50%" },
  { id: "quimica", name: "Química", icon: "🧪", color: "142 71% 45%" },
  { id: "biologia", name: "Biologia", icon: "🧬", color: "160 60% 45%" },
  { id: "historia", name: "História", icon: "🏛️", color: "25 95% 53%" },
  { id: "geografia", name: "Geografia", icon: "🌍", color: "200 70% 50%" },
  { id: "filosofia", name: "Filosofia", icon: "🤔", color: "280 60% 50%" },
  { id: "sociologia", name: "Sociologia", icon: "👥", color: "0 84% 60%" },
  { id: "ingles", name: "Inglês", icon: "🇬🇧", color: "340 80% 55%" },
  { id: "arte", name: "Arte", icon: "🎨", color: "300 60% 50%" },
  { id: "educacao-fisica", name: "Educação Física", icon: "⚽", color: "45 93% 47%" },
];

const topics6ano: Record<string, string[]> = {
  portugues: ["Gêneros textuais: contos e fábulas", "Substantivos e adjetivos", "Pontuação e ortografia", "Interpretação de texto", "Narrativa e seus elementos", "Pronomes pessoais e possessivos", "Verbos: presente, passado e futuro", "Produção de texto narrativo"],
  matematica: ["Números naturais e operações", "Frações e números decimais", "Geometria: figuras planas", "Medidas de comprimento e área", "Porcentagem básica", "Ângulos e retas", "Problemas com as 4 operações", "Gráficos e tabelas"],
  ciencias: ["Matéria e suas transformações", "Misturas homogêneas e heterogêneas", "Célula: unidade da vida", "Ecossistemas e meio ambiente", "Água e seus estados físicos", "Solo e rochas", "Ar atmosférico", "Seres vivos e classificação"],
  historia: ["Primeiros seres humanos", "Mesopotâmia e Egito Antigo", "Grécia Antiga", "Roma Antiga", "Povos indígenas do Brasil", "África Antiga", "Feudalismo", "Patrimônio cultural"],
  geografia: ["Paisagem e lugar", "Orientação e localização", "Mapas e representações", "Relevo e hidrografia do Brasil", "Clima e vegetação", "Zona rural e zona urbana", "População brasileira", "Regiões do Brasil"],
  ingles: ["Greetings and introductions", "Numbers and colors", "Family members", "School objects", "Days and months", "Simple Present", "Food and drinks", "Parts of the body"],
  arte: ["Elementos visuais: ponto, linha, forma", "Cores primárias e secundárias", "Arte rupestre", "Música e ritmo", "Teatro e expressão corporal", "Arte indígena brasileira"],
  "educacao-fisica": ["Jogos cooperativos", "Esportes de marca", "Ginástica geral", "Danças populares", "Brincadeiras e jogos", "Saúde e qualidade de vida"],
  "ensino-religioso": ["Tradições religiosas", "Símbolos sagrados", "Festas religiosas", "Valores humanos", "Respeito à diversidade", "Ética e convivência"],
};

const topics7ano: Record<string, string[]> = {
  portugues: ["Gêneros textuais: crônicas e poemas", "Verbos regulares e irregulares", "Concordância verbal e nominal", "Tipos de sujeito e predicado", "Figuras de linguagem", "Texto argumentativo", "Coesão e coerência", "Variação linguística"],
  matematica: ["Números inteiros e racionais", "Equações do 1º grau", "Razão e proporção", "Regra de três simples", "Ângulos e triângulos", "Área e perímetro", "Estatística básica", "Probabilidade"],
  ciencias: ["Ecologia e cadeia alimentar", "Biomas brasileiros", "Sistema digestório", "Sistema respiratório", "Sistema circulatório", "Máquinas simples e energia", "Calor e temperatura", "Substâncias e reações químicas"],
  historia: ["Expansão marítima europeia", "Colonização do Brasil", "Povos africanos", "Reforma Protestante", "Absolutismo", "Mercantilismo", "Escravidão no Brasil", "Cultura colonial"],
  geografia: ["Formação territorial do Brasil", "Urbanização brasileira", "Industrialização", "Agropecuária no Brasil", "Recursos naturais", "Impactos ambientais", "Biomas e domínios morfoclimáticos", "Migração e população"],
  ingles: ["Present Continuous", "There is / There are", "Prepositions of place", "Can and Can't", "Hobbies and sports", "Describing people", "Past Simple (regular)", "Countable and uncountable nouns"],
  arte: ["Arte medieval", "Música popular brasileira", "Dança contemporânea", "Grafite e arte urbana", "Fotografia artística", "Teatro de bonecos"],
  "educacao-fisica": ["Esportes coletivos: futebol e vôlei", "Atletismo", "Lutas: judô e capoeira", "Ginástica rítmica", "Práticas corporais de aventura", "Nutrição e exercício"],
  "ensino-religioso": ["Crenças e filosofias de vida", "Ancestralidade", "Vida e morte nas tradições", "Lideranças religiosas", "Textos sagrados", "Diálogo inter-religioso"],
};

const topics8ano: Record<string, string[]> = {
  portugues: ["Gêneros textuais: reportagem e editorial", "Período composto por coordenação", "Vozes verbais", "Tipos de discurso", "Artigo de opinião", "Crase", "Regência verbal e nominal", "Literatura brasileira: Romantismo"],
  matematica: ["Conjuntos numéricos", "Potenciação e radiciação", "Expressões algébricas", "Sistemas de equações", "Teorema de Pitágoras", "Transformações geométricas", "Volume de sólidos", "Notação científica"],
  ciencias: ["Sistema nervoso", "Sistema endócrino", "Reprodução humana", "Sexualidade e saúde", "Força e movimento", "Pressão atmosférica", "Ondas sonoras", "Luz e óptica"],
  historia: ["Revolução Industrial", "Revolução Francesa", "Independência do Brasil", "Primeiro Reinado", "Segundo Reinado", "Abolição da escravatura", "República Velha", "Imperialismo"],
  geografia: ["Continente americano", "América Latina", "Estados Unidos e Canadá", "Globalização", "Comércio internacional", "Blocos econômicos", "Conflitos mundiais", "Questões ambientais globais"],
  ingles: ["Past Simple (irregular)", "Comparatives and Superlatives", "Future with Will and Going to", "First Conditional", "Modal verbs", "Relative pronouns", "Passive voice (intro)", "Reading comprehension strategies"],
  arte: ["Renascimento", "Barroco brasileiro", "Cinema e linguagem audiovisual", "Expressionismo", "Arte e tecnologia", "Patrimônio artístico cultural"],
  "educacao-fisica": ["Esportes de rede: badminton e tênis", "Práticas corporais e saúde", "Exercícios físicos e bem-estar", "Esportes adaptados", "Doping no esporte", "Mídia e esporte"],
  "ensino-religioso": ["Doutrinas religiosas", "Crenças e práticas", "Religião e ciência", "Fundamentalismo", "Laicidade do Estado", "Tolerância religiosa"],
};

const topics9ano: Record<string, string[]> = {
  portugues: ["Gêneros textuais: dissertação e resenha", "Período composto por subordinação", "Orações subordinadas", "Concordância e regência", "Intertextualidade", "Modernismo brasileiro", "Redação dissertativa-argumentativa", "Análise crítica de textos"],
  matematica: ["Função do 1º grau", "Função do 2º grau", "Equação do 2º grau", "Relações métricas no triângulo", "Trigonometria básica", "Probabilidade e estatística", "Semelhança de triângulos", "Gráficos de funções"],
  ciencias: ["Estrutura atômica", "Tabela Periódica", "Ligações químicas", "Reações químicas", "Cinemática", "Leis de Newton", "Energia e suas formas", "Genética básica"],
  historia: ["Primeira Guerra Mundial", "Revolução Russa", "Crise de 1929", "Era Vargas", "Segunda Guerra Mundial", "Guerra Fria", "Ditadura militar no Brasil", "Redemocratização"],
  geografia: ["Europa: aspectos físicos e humanos", "Ásia: diversidade cultural", "África contemporânea", "Oriente Médio", "Oceania e regiões polares", "Ordem mundial contemporânea", "Desenvolvimento e subdesenvolvimento", "Geopolítica atual"],
  ingles: ["Present Perfect", "Second Conditional", "Reported Speech", "Phrasal Verbs", "Connectors and linking words", "Writing essays", "Reading and interpretation", "Vocabulary for ENEM"],
  arte: ["Modernismo", "Pop Art", "Arte contemporânea", "Música brasileira contemporânea", "Videoarte e instalações", "Arte e sociedade"],
  "educacao-fisica": ["Esportes de combate", "Treinamento funcional", "Práticas integrativas", "Esporte e sociedade", "Padrões de beleza e saúde", "Lazer e qualidade de vida"],
  "ensino-religioso": ["Filosofia e espiritualidade", "Bioética", "Direitos humanos e religião", "Religião e política", "Diversidade religiosa no Brasil", "Sentido da vida"],
};

const topics1em: Record<string, string[]> = {
  portugues: ["Funções da linguagem", "Gêneros literários", "Trovadorismo e Humanismo", "Classicismo e Quinhentismo", "Barroco", "Arcadismo", "Morfologia: classes gramaticais", "Sintaxe: termos da oração"],
  matematica: ["Conjuntos e operações", "Função afim", "Função quadrática", "Função exponencial", "Função logarítmica", "Progressão aritmética (PA)", "Progressão geométrica (PG)", "Trigonometria no triângulo retângulo"],
  fisica: ["Cinemática: MRU e MRUV", "Vetores", "Leis de Newton", "Trabalho e energia", "Impulso e quantidade de movimento", "Gravitação universal", "Estática", "Hidrostática"],
  quimica: ["Modelos atômicos", "Tabela Periódica e propriedades", "Ligações químicas", "Geometria molecular", "Funções inorgânicas: ácidos e bases", "Funções inorgânicas: sais e óxidos", "Reações químicas e balanceamento", "Cálculos estequiométricos"],
  biologia: ["Bioquímica celular", "Citologia: organelas", "Divisão celular: mitose e meiose", "Metabolismo energético", "Histologia animal", "Histologia vegetal", "Ecologia: conceitos básicos", "Ecologia: ciclos biogeoquímicos"],
  historia: ["Pré-história", "Civilizações antigas", "Idade Média", "Feudalismo", "Renascimento", "Reforma e Contrarreforma", "Grandes Navegações", "Colonização da América"],
  geografia: ["Cartografia e geotecnologias", "Estrutura geológica e relevo", "Climatologia", "Hidrografia", "Biomas mundiais", "Solo e agricultura", "Fontes de energia", "Questões ambientais"],
  filosofia: ["O que é Filosofia?", "Mito e razão", "Pré-socráticos", "Sócrates, Platão e Aristóteles", "Lógica e argumentação", "Ética e moral", "Filosofia medieval", "Teoria do conhecimento"],
  sociologia: ["O que é Sociologia?", "Senso comum e conhecimento científico", "Émile Durkheim", "Karl Marx", "Max Weber", "Socialização e cultura", "Trabalho e sociedade", "Desigualdade social"],
  ingles: ["Present tenses review", "Past tenses review", "Future tenses", "Modal verbs", "Conditionals", "Passive voice", "Reported speech", "Text interpretation for ENEM"],
  arte: ["Arte na Pré-história", "Arte Clássica", "Arte Medieval", "Renascimento artístico", "Barroco e Rococó", "Arte colonial brasileira"],
  "educacao-fisica": ["Esportes e saúde", "Treinamento esportivo", "Corpo, movimento e saúde", "Doping e fair play", "Esportes de aventura", "Ginástica e condicionamento"],
};

const topics2em: Record<string, string[]> = {
  portugues: ["Romantismo: prosa e poesia", "Realismo e Naturalismo", "Parnasianismo e Simbolismo", "Pré-Modernismo", "Sintaxe: período composto", "Concordância verbal e nominal", "Regência verbal e nominal", "Crase e pontuação"],
  matematica: ["Matrizes", "Determinantes", "Sistemas lineares", "Análise combinatória", "Probabilidade", "Binômio de Newton", "Geometria espacial: prismas e pirâmides", "Geometria espacial: cilindros, cones e esferas"],
  fisica: ["Termologia: calor e temperatura", "Calorimetria", "Termodinâmica", "Óptica geométrica", "Espelhos e lentes", "Ondulatória", "Acústica", "Óptica da visão"],
  quimica: ["Soluções", "Propriedades coligativas", "Termoquímica", "Cinética química", "Equilíbrio químico", "pH e pOH", "Eletroquímica", "Radioatividade"],
  biologia: ["Classificação dos seres vivos", "Vírus e bactérias", "Protistas e fungos", "Botânica: morfologia vegetal", "Botânica: fisiologia vegetal", "Zoologia: invertebrados", "Zoologia: vertebrados", "Fisiologia humana"],
  historia: ["Iluminismo", "Revolução Industrial", "Revolução Francesa", "Era Napoleônica", "Independências na América", "Brasil Império", "Abolição e República", "Imperialismo e neocolonialismo"],
  geografia: ["Demografia e crescimento populacional", "Urbanização mundial", "Industrialização global", "Comércio e globalização", "Agricultura e questão agrária", "América Latina", "Europa: economia e política", "Ásia: crescimento econômico"],
  filosofia: ["Racionalismo: Descartes", "Empirismo: Locke e Hume", "Idealismo: Kant e Hegel", "Filosofia política: contratualismo", "Utilitarismo", "Existencialismo", "Fenomenologia", "Estética e arte"],
  sociologia: ["Instituições sociais", "Estado e poder", "Democracia e cidadania", "Movimentos sociais", "Gênero e sexualidade", "Raça e etnia", "Mídia e sociedade", "Indústria cultural"],
  ingles: ["Verb tenses advanced", "Relative clauses", "Connectors and discourse markers", "Collocations and idioms", "Academic writing", "Debate and argumentation", "Literature in English", "ENEM practice"],
  arte: ["Neoclassicismo", "Impressionismo", "Expressionismo e Cubismo", "Surrealismo e Dadaísmo", "Modernismo brasileiro", "Semana de Arte Moderna"],
  "educacao-fisica": ["Esportes coletivos avançados", "Biomecânica", "Fisiologia do exercício", "Primeiros socorros", "Dança e expressão", "Esportes e mídia"],
};

const topics3em: Record<string, string[]> = {
  portugues: ["Modernismo 1ª fase", "Modernismo 2ª fase", "Modernismo 3ª fase", "Literatura contemporânea", "Redação ENEM: estrutura", "Redação ENEM: competências", "Interpretação de textos complexos", "Revisão geral para o ENEM"],
  matematica: ["Geometria analítica: ponto e reta", "Geometria analítica: circunferência", "Geometria analítica: cônicas", "Números complexos", "Polinômios", "Equações polinomiais", "Estatística avançada", "Revisão ENEM: funções e gráficos"],
  fisica: ["Carga elétrica e Lei de Coulomb", "Campo elétrico", "Potencial elétrico", "Corrente elétrica e resistores", "Circuitos elétricos", "Magnetismo", "Indução eletromagnética", "Física moderna: relatividade e quântica"],
  quimica: ["Química orgânica: cadeias carbônicas", "Funções orgânicas: hidrocarbonetos", "Funções orgânicas: oxigenadas", "Funções orgânicas: nitrogenadas", "Isomeria", "Reações orgânicas", "Polímeros", "Bioquímica e química ambiental"],
  biologia: ["Genética mendeliana", "Genética: 2ª Lei de Mendel", "Genética: herança ligada ao sexo", "Biotecnologia e engenharia genética", "Evolução: Darwin e Lamarck", "Evolução: evidências e especiação", "Ecologia: dinâmica de populações", "Ecologia: impactos ambientais"],
  historia: ["Primeira Guerra Mundial", "Revolução Russa", "Crise de 1929 e nazifascismo", "Segunda Guerra Mundial", "Guerra Fria", "Era Vargas", "Ditadura militar no Brasil", "Brasil contemporâneo e globalização"],
  geografia: ["Geopolítica mundial", "Conflitos internacionais", "Oriente Médio", "África contemporânea", "Questão ambiental global", "Desenvolvimento sustentável", "Brasil: economia e sociedade", "Revisão ENEM: temas recorrentes"],
  filosofia: ["Filosofia da ciência", "Escola de Frankfurt", "Pós-modernidade", "Biopolítica: Foucault", "Filosofia da linguagem", "Ética contemporânea", "Filosofia política contemporânea", "Revisão ENEM"],
  sociologia: ["Globalização e sociedade", "Violência e segurança pública", "Direitos humanos", "Questão indígena e quilombola", "Meio ambiente e sociedade", "Tecnologia e sociedade", "Cidadania e participação política", "Revisão ENEM"],
  ingles: ["Advanced reading comprehension", "Critical thinking in English", "Genres and text types", "Vocabulary in context", "Grammar review", "Translation techniques", "ENEM strategies", "Cultural aspects"],
  arte: ["Arte contemporânea brasileira", "Arte digital e novas mídias", "Performance e happening", "Arte e política", "Curadoria e museus", "Produção artística e mercado"],
  "educacao-fisica": ["Políticas públicas de esporte", "Corpo e cultura", "Exercício e envelhecimento", "Atividade física e saúde mental", "Esportes paralímpicos", "Projeto de vida e saúde"],
};

export const grades: Grade[] = [
  { id: "6ano", name: "6º Ano", level: "Ensino Fundamental", subjects: commonSubjects, topics: topics6ano },
  { id: "7ano", name: "7º Ano", level: "Ensino Fundamental", subjects: commonSubjects, topics: topics7ano },
  { id: "8ano", name: "8º Ano", level: "Ensino Fundamental", subjects: commonSubjects, topics: topics8ano },
  { id: "9ano", name: "9º Ano", level: "Ensino Fundamental", subjects: commonSubjects, topics: topics9ano },
  { id: "1em", name: "1º Ano EM", level: "Ensino Médio", subjects: emSubjects, topics: topics1em },
  { id: "2em", name: "2º Ano EM", level: "Ensino Médio", subjects: emSubjects, topics: topics2em },
  { id: "3em", name: "3º Ano EM", level: "Ensino Médio", subjects: emSubjects, topics: topics3em },
];

export function getGrade(id: string): Grade | undefined {
  return grades.find(g => g.id === id);
}

export function getSubject(gradeId: string, subjectId: string): Subject | undefined {
  const grade = getGrade(gradeId);
  return grade?.subjects.find(s => s.id === subjectId);
}

export function getTopics(gradeId: string, subjectId: string): string[] {
  const grade = getGrade(gradeId);
  return grade?.topics[subjectId] || [];
}
