export const GRADES = [
  { id: "6ano", name: "6º Ano" },
  { id: "7ano", name: "7º Ano" },
  { id: "8ano", name: "8º Ano" },
  { id: "9ano", name: "9º Ano" },
  { id: "1em", name: "1º Ano EM" },
  { id: "2em", name: "2º Ano EM" },
  { id: "3em", name: "3º Ano EM" },
];

export const TURMAS = [
  "1º ano - 929 - Automação",
  "1º ano - 930 - Des. de Sistema",
  "1º ano - 931 - Eletromecânica",
  "1º ano - 932 - IOT",
  "1º ano - 933 - Mecânica",
  "1º ano - 935 - Mecatrônica",
  "2º ano - 881 - Automação",
  "2º ano - 912 - Des. de Sistemas",
  "2º ano - 915 - Eletromecânica",
  "2º ano - 918 - IOT",
  "2º ano - 919 - Mecatrônica",
  "2º ano - 920 - Mecânica",
  "3º ano - 921 - Automação",
  "3º ano - 922 - Des. de Sistemas",
  "3º ano - 923 - Eletromecânica",
  "3º ano - 924 - IOT",
  "3º ano - 925 - Mecânica",
  "3º ano - 926 - Mecatrônica",
];

export const ALL_SUBJECTS = [
  { id: "matematica", name: "Matemática" },
  { id: "portugues", name: "Português" },
  { id: "historia", name: "História" },
  { id: "geografia", name: "Geografia" },
  { id: "ciencias", name: "Ciências" },
  { id: "fisica", name: "Física" },
  { id: "quimica", name: "Química" },
  { id: "biologia", name: "Biologia" },
  { id: "ingles", name: "Inglês" },
  { id: "logica", name: "Lógica" },
  { id: "filosofia", name: "Filosofia" },
  { id: "sociologia", name: "Sociologia" },
  { id: "arte", name: "Arte" },
  { id: "educacao-fisica", name: "Ed. Física" },
];

// Grade-specific questions with difficulty progression
type Question = { q: string; options: string[]; correct: string };

const QUESTIONS_6ANO: Record<string, Question[]> = {
  matematica: [
    { q: "Quanto é 15 × 8?", options: ["110", "120", "130", "140"], correct: "120" },
    { q: "Quanto é 144 ÷ 12?", options: ["10", "11", "12", "13"], correct: "12" },
    { q: "Qual o MMC de 4 e 6?", options: ["8", "10", "12", "24"], correct: "12" },
    { q: "Quanto é 3/4 + 1/4?", options: ["1/2", "1", "4/4", "2/4"], correct: "1" },
    { q: "Quantos lados tem um hexágono?", options: ["5", "6", "7", "8"], correct: "6" },
    { q: "Qual é 25% de 200?", options: ["25", "40", "50", "75"], correct: "50" },
    { q: "Quanto é 2³?", options: ["6", "8", "9", "12"], correct: "8" },
    { q: "Qual a raiz quadrada de 49?", options: ["6", "7", "8", "9"], correct: "7" },
    { q: "Qual número é primo?", options: ["4", "9", "11", "15"], correct: "11" },
    { q: "Quanto é 0,5 + 0,25?", options: ["0,30", "0,55", "0,75", "1,00"], correct: "0,75" },
  ],
  portugues: [
    { q: "Qual é o sujeito de 'O gato dormiu'?", options: ["gato", "dormiu", "O", "o gato"], correct: "o gato" },
    { q: "Qual palavra é um advérbio?", options: ["bonito", "rapidamente", "casa", "azul"], correct: "rapidamente" },
    { q: "'Ela chegou cedo.' O verbo é:", options: ["Ela", "chegou", "cedo", "Nenhum"], correct: "chegou" },
    { q: "Qual é o plural de 'animal'?", options: ["animais", "animals", "animás", "animales"], correct: "animais" },
    { q: "Qual é um substantivo próprio?", options: ["cidade", "Brasil", "menino", "rio"], correct: "Brasil" },
    { q: "Sinônimo de 'contente':", options: ["triste", "feliz", "bravo", "quieto"], correct: "feliz" },
    { q: "'O menino ___ alto.' Complete:", options: ["são", "é", "sou", "somos"], correct: "é" },
    { q: "Qual frase tem erro?", options: ["Exceção", "Essessão", "Excesso", "Extensão"], correct: "Essessão" },
    { q: "Qual é o antônimo de 'alto'?", options: ["grande", "baixo", "largo", "fino"], correct: "baixo" },
    { q: "Artigo definido feminino:", options: ["um", "a", "uns", "o"], correct: "a" },
  ],
  historia: [
    { q: "Qual civilização construiu as pirâmides de Gizé?", options: ["Romana", "Grega", "Egípcia", "Maia"], correct: "Egípcia" },
    { q: "Na Pré-história, o Neolítico é marcado por:", options: ["Caça", "Agricultura", "Escrita", "Metal"], correct: "Agricultura" },
    { q: "A democracia nasceu em qual cidade grega?", options: ["Esparta", "Tebas", "Atenas", "Corinto"], correct: "Atenas" },
    { q: "Os rios Tigre e Eufrates ficam na:", options: ["Índia", "Egito", "Mesopotâmia", "China"], correct: "Mesopotâmia" },
    { q: "Qual povo inventou o alfabeto?", options: ["Gregos", "Fenícios", "Romanos", "Egípcios"], correct: "Fenícios" },
    { q: "Zeus era o deus grego de:", options: ["Mar", "Guerra", "Trovão", "Sol"], correct: "Trovão" },
    { q: "Roma foi fundada em qual península?", options: ["Ibérica", "Balcânica", "Itálica", "Escandinava"], correct: "Itálica" },
    { q: "Fonte histórica é:", options: ["Apenas texto", "Qualquer vestígio do passado", "Só foto", "Só vídeo"], correct: "Qualquer vestígio do passado" },
  ],
  geografia: [
    { q: "Quantos continentes existem?", options: ["5", "6", "7", "8"], correct: "7" },
    { q: "Qual bioma ocupa maior área no Brasil?", options: ["Cerrado", "Amazônia", "Caatinga", "Mata Atlântica"], correct: "Amazônia" },
    { q: "Os pontos cardeais são:", options: ["2", "4", "6", "8"], correct: "4" },
    { q: "Qual é a capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correct: "Brasília" },
    { q: "O que é um mapa temático?", options: ["Mapa com cores", "Mapa de um tema específico", "Mapa grande", "Mapa antigo"], correct: "Mapa de um tema específico" },
    { q: "Zona rural é caracterizada por:", options: ["Indústrias", "Prédios", "Agropecuária", "Shoppings"], correct: "Agropecuária" },
    { q: "O relevo de planície é:", options: ["Muito alto", "Plano e baixo", "Montanhoso", "Ondulado"], correct: "Plano e baixo" },
    { q: "Qual rio é o maior do Brasil?", options: ["São Francisco", "Paraná", "Amazonas", "Tietê"], correct: "Amazonas" },
  ],
  ciencias: [
    { q: "Qual gás as plantas absorvem na fotossíntese?", options: ["Oxigênio", "Nitrogênio", "CO₂", "Hidrogênio"], correct: "CO₂" },
    { q: "Qual é a fórmula da água?", options: ["H₂O", "CO₂", "NaCl", "O₂"], correct: "H₂O" },
    { q: "Qual órgão bombeia sangue?", options: ["Pulmão", "Fígado", "Coração", "Rim"], correct: "Coração" },
    { q: "Quais são os estados da matéria?", options: ["2", "3", "4", "5"], correct: "3" },
    { q: "A célula é a unidade básica da:", options: ["matéria", "vida", "energia", "química"], correct: "vida" },
    { q: "O ciclo da água inclui:", options: ["Evaporação", "Fervura", "Congelamento", "Derretimento"], correct: "Evaporação" },
    { q: "Mistura homogênea é:", options: ["Água + óleo", "Água + sal dissolvido", "Areia + água", "Feijão + arroz"], correct: "Água + sal dissolvido" },
    { q: "Os seres vivos são classificados em:", options: ["3 reinos", "5 reinos", "7 reinos", "2 reinos"], correct: "5 reinos" },
  ],
  ingles: [
    { q: "Translate: 'Eu sou estudante'", options: ["I am student", "I am a student", "I is student", "Me am student"], correct: "I am a student" },
    { q: "Opposite of 'hot':", options: ["warm", "cold", "cool", "ice"], correct: "cold" },
    { q: "'She ___ a book.' (present)", options: ["read", "reads", "reading", "readed"], correct: "reads" },
    { q: "How do you say 'azul' in English?", options: ["Red", "Green", "Blue", "Yellow"], correct: "Blue" },
    { q: "Days of the week: Monday, Tuesday, ___", options: ["Thursday", "Wednesday", "Friday", "Sunday"], correct: "Wednesday" },
    { q: "'They ___ playing football.' (now)", options: ["is", "was", "are", "be"], correct: "are" },
    { q: "What is 'gato' in English?", options: ["Dog", "Cat", "Bird", "Fish"], correct: "Cat" },
    { q: "The pencil is ___ the table.", options: ["in", "on", "under", "at"], correct: "on" },
  ],
  logica: [
    { q: "Próximo: 2, 4, 6, 8, ...", options: ["9", "10", "11", "12"], correct: "10" },
    { q: "Se A=2 e B=3, quanto é A+B?", options: ["4", "5", "6", "7"], correct: "5" },
    { q: "Se todo gato é animal, e Rex é gato:", options: ["Rex é planta", "Rex é animal", "Rex voa", "Nada"], correct: "Rex é animal" },
    { q: "Quantos triângulos num quadrado com diagonal?", options: ["1", "2", "3", "4"], correct: "2" },
    { q: "3 + 3 × 2 = ?", options: ["9", "12", "6", "8"], correct: "9" },
  ],
  filosofia: [
    { q: "Filosofia significa:", options: ["Amor à ciência", "Amor à sabedoria", "Amor à arte", "Amor à natureza"], correct: "Amor à sabedoria" },
    { q: "Quem disse 'Só sei que nada sei'?", options: ["Platão", "Aristóteles", "Sócrates", "Tales"], correct: "Sócrates" },
    { q: "Ética estuda:", options: ["Números", "Comportamento humano", "Planetas", "Animais"], correct: "Comportamento humano" },
  ],
  sociologia: [
    { q: "A família é uma:", options: ["Lei", "Instituição social", "Ciência", "Arte"], correct: "Instituição social" },
    { q: "Cultura é:", options: ["Só música", "Tudo produzido pelo ser humano", "Só comida", "Só roupa"], correct: "Tudo produzido pelo ser humano" },
  ],
  arte: [
    { q: "Cores primárias são:", options: ["Verde, roxo, laranja", "Vermelho, azul, amarelo", "Preto, branco, cinza", "Rosa, lilás, bege"], correct: "Vermelho, azul, amarelo" },
    { q: "Arte rupestre é feita em:", options: ["Telas", "Paredes de cavernas", "Papel", "Computador"], correct: "Paredes de cavernas" },
  ],
  "educacao-fisica": [
    { q: "O aquecimento antes do exercício serve para:", options: ["Cansar", "Preparar o corpo", "Emagrecer", "Dormir melhor"], correct: "Preparar o corpo" },
    { q: "Esporte coletivo é:", options: ["Natação", "Futebol", "Corrida", "Ciclismo"], correct: "Futebol" },
  ],
  fisica: [],
  quimica: [],
  biologia: [],
};

const QUESTIONS_7ANO: Record<string, Question[]> = {
  matematica: [
    { q: "Quanto é (-3) × (-4)?", options: ["-12", "12", "-7", "7"], correct: "12" },
    { q: "Resolva: x + 5 = 12", options: ["5", "6", "7", "17"], correct: "7" },
    { q: "Qual é a razão de 15 para 5?", options: ["2", "3", "5", "10"], correct: "3" },
    { q: "10% de 350 =", options: ["25", "30", "35", "45"], correct: "35" },
    { q: "Soma dos ângulos de um triângulo:", options: ["90°", "180°", "270°", "360°"], correct: "180°" },
    { q: "Quanto é 2/3 de 90?", options: ["30", "45", "60", "80"], correct: "60" },
    { q: "Se 3x = 21, então x =", options: ["6", "7", "8", "9"], correct: "7" },
    { q: "A mediana de 3, 5, 7 é:", options: ["3", "5", "7", "15"], correct: "5" },
    { q: "Regra de 3: se 2→10, então 5→?", options: ["15", "20", "25", "50"], correct: "25" },
    { q: "Quanto é (-8) + 3?", options: ["-11", "-5", "5", "11"], correct: "-5" },
  ],
  portugues: [
    { q: "Em 'O menino correu rápido', o sujeito é:", options: ["correu", "rápido", "O menino", "menino"], correct: "O menino" },
    { q: "Qual é o predicado de 'Maria estudou'?", options: ["Maria", "estudou", "Maria estudou", "Nenhum"], correct: "estudou" },
    { q: "Verbo no pretérito perfeito:", options: ["corro", "corri", "correrei", "corra"], correct: "corri" },
    { q: "Metáfora é:", options: ["Exagero", "Comparação implícita", "Repetição", "Contradição"], correct: "Comparação implícita" },
    { q: "Qual é objeto direto em 'Ele comprou o livro'?", options: ["Ele", "comprou", "o livro", "livro"], correct: "o livro" },
    { q: "Coesão textual serve para:", options: ["Enfeitar", "Conectar ideias", "Diminuir texto", "Repetir palavras"], correct: "Conectar ideias" },
    { q: "Concordância: 'Os meninos ___'", options: ["correu", "correram", "corre", "correndo"], correct: "correram" },
    { q: "Crônica é um texto:", options: ["Longo e científico", "Curto sobre o cotidiano", "Só de poesia", "Só de ficção"], correct: "Curto sobre o cotidiano" },
  ],
  historia: [
    { q: "Quem chegou ao Brasil em 1500?", options: ["Colombo", "Cabral", "Vespúcio", "Magalhães"], correct: "Cabral" },
    { q: "Capitanias hereditárias foram criadas por:", options: ["D. João III", "D. Pedro I", "Tiradentes", "Cabral"], correct: "D. João III" },
    { q: "A principal riqueza do Brasil colonial era:", options: ["Ouro", "Cana-de-açúcar", "Café", "Algodão"], correct: "Cana-de-açúcar" },
    { q: "Quilombo dos Palmares foi liderado por:", options: ["Tiradentes", "Zumbi", "Cabral", "Getúlio"], correct: "Zumbi" },
    { q: "A Reforma Protestante foi iniciada por:", options: ["Calvino", "Lutero", "Henrique VIII", "Papa"], correct: "Lutero" },
    { q: "Mercantilismo defendia:", options: ["Livre comércio", "Acúmulo de metais", "Socialismo", "Comunismo"], correct: "Acúmulo de metais" },
    { q: "Absolutismo = poder concentrado no:", options: ["Povo", "Parlamento", "Rei", "Papa"], correct: "Rei" },
    { q: "Escravidão no Brasil durou até:", options: ["1822", "1850", "1888", "1889"], correct: "1888" },
  ],
  geografia: [
    { q: "Urbanização é o crescimento de:", options: ["Florestas", "Cidades", "Rios", "Montanhas"], correct: "Cidades" },
    { q: "Recurso renovável:", options: ["Petróleo", "Carvão", "Energia solar", "Gás natural"], correct: "Energia solar" },
    { q: "Maior bacia hidrográfica do Brasil:", options: ["Paraná", "São Francisco", "Amazônica", "Tocantins"], correct: "Amazônica" },
    { q: "Desmatamento causa:", options: ["Mais chuva", "Erosão do solo", "Mais biodiversidade", "Frio"], correct: "Erosão do solo" },
    { q: "Setor primário inclui:", options: ["Indústria", "Comércio", "Agricultura", "Tecnologia"], correct: "Agricultura" },
    { q: "Metrópole é uma cidade:", options: ["Pequena", "Média", "Grande e influente", "Rural"], correct: "Grande e influente" },
  ],
  ciencias: [
    { q: "Sistema digestório começa na:", options: ["Estômago", "Boca", "Intestino", "Faringe"], correct: "Boca" },
    { q: "Cadeia alimentar começa com:", options: ["Herbívoro", "Carnívoro", "Produtor", "Decompositor"], correct: "Produtor" },
    { q: "Calor se propaga por:", options: ["Só condução", "Condução, convecção e radiação", "Só radiação", "Gravidade"], correct: "Condução, convecção e radiação" },
    { q: "Nutrientes energéticos são:", options: ["Vitaminas", "Carboidratos e lipídios", "Água e sais", "Fibras"], correct: "Carboidratos e lipídios" },
    { q: "Sistema circulatório transporta:", options: ["Apenas água", "Sangue", "Apenas ar", "Comida"], correct: "Sangue" },
    { q: "Bioma do Nordeste seco:", options: ["Amazônia", "Cerrado", "Caatinga", "Pantanal"], correct: "Caatinga" },
  ],
  ingles: [
    { q: "Present Continuous: 'She ___ reading.'", options: ["is", "are", "am", "be"], correct: "is" },
    { q: "Past of 'go':", options: ["goed", "went", "gone", "going"], correct: "went" },
    { q: "'There ___ many books on the shelf.'", options: ["is", "are", "be", "was"], correct: "are" },
    { q: "'Can' expresses:", options: ["Obligation", "Ability", "Desire", "Past"], correct: "Ability" },
    { q: "Adverb of frequency: 'always' means:", options: ["Nunca", "Às vezes", "Sempre", "Raramente"], correct: "Sempre" },
    { q: "Past Simple of 'eat':", options: ["eated", "ate", "eaten", "eating"], correct: "ate" },
  ],
  logica: [
    { q: "Próximo: 2, 4, 8, 16, ...", options: ["20", "24", "32", "30"], correct: "32" },
    { q: "Se A=2 e B=3, quanto é A+B×2?", options: ["10", "8", "7", "12"], correct: "8" },
    { q: "3! (fatorial) é igual a:", options: ["3", "6", "9", "12"], correct: "6" },
    { q: "Se P→Q é verdadeiro e P é verdadeiro:", options: ["Q é falso", "Q é verdadeiro", "Nada se conclui", "P é falso"], correct: "Q é verdadeiro" },
    { q: "Quantos quadrados num tabuleiro 2×2?", options: ["4", "5", "6", "8"], correct: "5" },
  ],
  filosofia: [
    { q: "Platão criou a Teoria das:", options: ["Formas", "Ideias", "Números", "Artes"], correct: "Ideias" },
    { q: "Aristóteles foi mestre de:", options: ["Sócrates", "Platão", "Alexandre", "César"], correct: "Alexandre" },
  ],
  sociologia: [
    { q: "Socialização é o processo de:", options: ["Dormir", "Aprender a viver em sociedade", "Estudar só", "Trabalhar"], correct: "Aprender a viver em sociedade" },
  ],
  arte: [
    { q: "Grafite é considerado:", options: ["Crime sempre", "Arte urbana", "Só vandalismo", "Nada"], correct: "Arte urbana" },
    { q: "Cordel é literatura popular do:", options: ["Sul", "Sudeste", "Nordeste", "Norte"], correct: "Nordeste" },
  ],
  "educacao-fisica": [
    { q: "Capoeira é uma prática:", options: ["Só luta", "Luta, dança e cultura", "Só dança", "Só música"], correct: "Luta, dança e cultura" },
  ],
  fisica: [],
  quimica: [],
  biologia: [],
};

const QUESTIONS_8ANO: Record<string, Question[]> = {
  matematica: [
    { q: "Quanto é √169?", options: ["11", "12", "13", "14"], correct: "13" },
    { q: "Produtos notáveis: (a+b)² =", options: ["a²+b²", "a²+2ab+b²", "a²-b²", "2a+2b"], correct: "a²+2ab+b²" },
    { q: "Se x²=144, então x pode ser:", options: ["±11", "±12", "±13", "±14"], correct: "±12" },
    { q: "Teorema de Pitágoras: 3²+4²=", options: ["20", "25", "12", "7"], correct: "25" },
    { q: "Qual é 10⁻² em decimal?", options: ["0,1", "0,01", "0,001", "100"], correct: "0,01" },
    { q: "Volume de um cubo de aresta 3cm:", options: ["9cm³", "18cm³", "27cm³", "81cm³"], correct: "27cm³" },
    { q: "Notação científica de 5000:", options: ["5×10²", "5×10³", "50×10²", "0,5×10⁴"], correct: "5×10³" },
    { q: "Sistema: x+y=10 e x-y=4. x=?", options: ["5", "6", "7", "8"], correct: "7" },
    { q: "Fatoração de x²-9:", options: ["(x+3)²", "(x-3)²", "(x+3)(x-3)", "x(x-9)"], correct: "(x+3)(x-3)" },
    { q: "Semelhança: se k=2, área aumenta:", options: ["2×", "4×", "8×", "16×"], correct: "4×" },
  ],
  portugues: [
    { q: "Crase ocorre antes de:", options: ["Verbos", "Palavras femininas com artigo", "Pronomes", "Advérbios"], correct: "Palavras femininas com artigo" },
    { q: "Voz passiva de 'O aluno fez a prova':", options: ["A prova foi feita pelo aluno", "O aluno foi feito", "A prova fez o aluno", "Fez-se"], correct: "A prova foi feita pelo aluno" },
    { q: "Período composto por coordenação usa:", options: ["Pronomes", "Conjunções coordenativas", "Apenas verbos", "Artigos"], correct: "Conjunções coordenativas" },
    { q: "Ironia é uma figura de:", options: ["Pensamento", "Palavras", "Sintaxe", "Som"], correct: "Pensamento" },
    { q: "Regência: 'Assistir ao filme'. O 'ao' indica:", options: ["Objeto direto", "Objeto indireto", "Sujeito", "Adjunto"], correct: "Objeto indireto" },
    { q: "Romantismo brasileiro surgiu no século:", options: ["XVII", "XVIII", "XIX", "XX"], correct: "XIX" },
    { q: "Colocação pronominal - próclise é pronome:", options: ["Depois do verbo", "Antes do verbo", "No meio", "Separado"], correct: "Antes do verbo" },
    { q: "Antítese é a junção de:", options: ["Palavras iguais", "Ideias opostas", "Sons iguais", "Verbos"], correct: "Ideias opostas" },
  ],
  historia: [
    { q: "O Iluminismo valorizava:", options: ["Fé acima de tudo", "Razão e ciência", "Monarquia absoluta", "Escravidão"], correct: "Razão e ciência" },
    { q: "A Revolução Francesa ocorreu em:", options: ["1776", "1789", "1815", "1848"], correct: "1789" },
    { q: "A Revolução Industrial começou na:", options: ["França", "Alemanha", "Inglaterra", "EUA"], correct: "Inglaterra" },
    { q: "D. Pedro I proclamou a independência em:", options: ["1808", "1822", "1889", "1891"], correct: "1822" },
    { q: "A Lei Áurea aboliu:", options: ["A monarquia", "A escravidão", "Os impostos", "A república"], correct: "A escravidão" },
    { q: "Quem proclamou a República?", options: ["D. Pedro II", "Deodoro", "Getúlio", "Tiradentes"], correct: "Deodoro" },
    { q: "Napoleão Bonaparte era:", options: ["Inglês", "Francês", "Espanhol", "Italiano"], correct: "Francês" },
    { q: "Imperialismo = domínio de:", options: ["Países sobre outros", "Reis sobre nobres", "Povo sobre rei", "Nenhum"], correct: "Países sobre outros" },
  ],
  geografia: [
    { q: "Globalização é:", options: ["Só internet", "Integração mundial", "Só comércio", "Isolamento"], correct: "Integração mundial" },
    { q: "MERCOSUL é um bloco da:", options: ["Europa", "Ásia", "América do Sul", "África"], correct: "América do Sul" },
    { q: "Aquecimento global é causado por:", options: ["Vulcões apenas", "Gases estufa", "Terremotos", "Marés"], correct: "Gases estufa" },
    { q: "ONU significa:", options: ["Organização Nacional Unida", "Organização das Nações Unidas", "Ordem Nacional", "Nenhuma"], correct: "Organização das Nações Unidas" },
    { q: "Refugiados fogem de:", options: ["Férias", "Conflitos e perseguições", "Escola", "Trabalho"], correct: "Conflitos e perseguições" },
    { q: "América Latina inclui:", options: ["Só Brasil", "Brasil, México e mais", "Só Argentina", "EUA e Canadá"], correct: "Brasil, México e mais" },
  ],
  ciencias: [
    { q: "O neurônio é a célula do sistema:", options: ["Digestório", "Nervoso", "Circulatório", "Respiratório"], correct: "Nervoso" },
    { q: "IST é transmitida por:", options: ["Ar", "Contato sexual", "Água", "Alimento"], correct: "Contato sexual" },
    { q: "Velocidade = distância ÷", options: ["massa", "tempo", "força", "peso"], correct: "tempo" },
    { q: "A luz se propaga em:", options: ["Linha curva", "Linha reta", "Espiral", "Ziguezague"], correct: "Linha reta" },
    { q: "Espelho plano forma imagem:", options: ["Maior", "Menor", "Igual", "Invertida"], correct: "Igual" },
    { q: "Hormônios são produzidos pelo sistema:", options: ["Nervoso", "Endócrino", "Digestório", "Locomotor"], correct: "Endócrino" },
  ],
  ingles: [
    { q: "Comparative: 'bigger' is the comparative of:", options: ["big", "bag", "bug", "beg"], correct: "big" },
    { q: "'Will' is used for:", options: ["Past", "Present", "Future", "Continuous"], correct: "Future" },
    { q: "First Conditional: 'If it rains, I ___ stay home.'", options: ["would", "will", "can", "did"], correct: "will" },
    { q: "'Must' expresses:", options: ["Ability", "Obligation", "Permission", "Wish"], correct: "Obligation" },
    { q: "Passive: 'The cake was ___ by Maria.'", options: ["make", "made", "making", "makes"], correct: "made" },
    { q: "Past Continuous: 'She ___ sleeping.'", options: ["is", "was", "were", "be"], correct: "was" },
  ],
  logica: [
    { q: "Se 2^x = 16, então x =", options: ["2", "3", "4", "8"], correct: "4" },
    { q: "Sequência: 1, 1, 2, 3, 5, ?", options: ["6", "7", "8", "10"], correct: "8" },
    { q: "Negação de 'Todos são altos':", options: ["Ninguém é alto", "Alguns não são altos", "Todos são baixos", "Nenhum"], correct: "Alguns não são altos" },
  ],
  fisica: [
    { q: "Qual a unidade de força no SI?", options: ["Joule", "Newton", "Watt", "Pascal"], correct: "Newton" },
    { q: "Aceleração da gravidade ≈", options: ["8,9 m/s²", "9,8 m/s²", "10,8 m/s²", "7,8 m/s²"], correct: "9,8 m/s²" },
    { q: "Energia cinética depende de:", options: ["Cor e forma", "Massa e velocidade", "Tempo", "Peso e altura"], correct: "Massa e velocidade" },
    { q: "1ª Lei de Newton é a Lei da:", options: ["Ação e reação", "Inércia", "Gravitação", "Termodinâmica"], correct: "Inércia" },
    { q: "Pressão = Força ÷", options: ["Massa", "Área", "Volume", "Tempo"], correct: "Área" },
  ],
  quimica: [
    { q: "pH 7 indica solução:", options: ["ácida", "básica", "neutra", "instável"], correct: "neutra" },
    { q: "NaCl é o nome químico de:", options: ["açúcar", "sal de cozinha", "vinagre", "álcool"], correct: "sal de cozinha" },
    { q: "Elétron tem carga:", options: ["Positiva", "Negativa", "Neutra", "Variável"], correct: "Negativa" },
    { q: "Tabela Periódica tem quantos elementos?", options: ["108", "112", "118", "120"], correct: "118" },
    { q: "Ligação iônica ocorre entre:", options: ["Não-metais", "Metal e não-metal", "Metais", "Gases"], correct: "Metal e não-metal" },
  ],
  biologia: [],
  filosofia: [
    { q: "O Iluminismo é chamado de Século das:", options: ["Trevas", "Luzes", "Guerras", "Artes"], correct: "Luzes" },
  ],
  sociologia: [
    { q: "Desigualdade social está ligada a:", options: ["Clima", "Distribuição de renda", "Esporte", "Cultura"], correct: "Distribuição de renda" },
  ],
  arte: [
    { q: "O Renascimento valorizava:", options: ["Religião apenas", "Arte e ciência", "Guerra", "Nada"], correct: "Arte e ciência" },
    { q: "Barroco brasileiro: principal artista:", options: ["Picasso", "Aleijadinho", "Monet", "Da Vinci"], correct: "Aleijadinho" },
  ],
  "educacao-fisica": [
    { q: "Exercício aeróbico melhora o sistema:", options: ["Nervoso", "Cardiovascular", "Esquelético", "Endócrino"], correct: "Cardiovascular" },
  ],
};

const QUESTIONS_9ANO: Record<string, Question[]> = {
  matematica: [
    { q: "Bhaskara: em x²-5x+6=0, as raízes são:", options: ["1 e 6", "2 e 3", "-2 e -3", "1 e 5"], correct: "2 e 3" },
    { q: "Função f(x)=2x+1, f(3)=?", options: ["5", "6", "7", "8"], correct: "7" },
    { q: "sen(30°) =", options: ["0", "1/2", "√2/2", "√3/2"], correct: "1/2" },
    { q: "cos(60°) =", options: ["0", "1/2", "√2/2", "√3/2"], correct: "1/2" },
    { q: "Função do 2º grau: parábola com a>0 tem:", options: ["Concavidade p/ baixo", "Concavidade p/ cima", "Reta", "Nenhum"], correct: "Concavidade p/ cima" },
    { q: "Juros simples: J = C×i×t. Se C=1000, i=10%, t=2:", options: ["100", "200", "300", "1200"], correct: "200" },
    { q: "Fibonacci: 1,1,2,3,5,8,?", options: ["10", "11", "13", "15"], correct: "13" },
    { q: "Teorema de Tales garante:", options: ["Igualdade de ângulos", "Proporcionalidade de segmentos", "Soma de lados", "Nada"], correct: "Proporcionalidade de segmentos" },
    { q: "Raiz de x²-16=0:", options: ["±2", "±4", "±8", "±16"], correct: "±4" },
    { q: "tan(45°) =", options: ["0", "1/2", "1", "√3"], correct: "1" },
  ],
  portugues: [
    { q: "Oração subordinada substantiva funciona como:", options: ["Adjetivo", "Advérbio", "Substantivo", "Verbo"], correct: "Substantivo" },
    { q: "Modernismo 1ª fase: Semana de Arte Moderna:", options: ["1912", "1922", "1932", "1942"], correct: "1922" },
    { q: "Dissertação-argumentativa tem:", options: ["Só narração", "Tese e argumentos", "Só descrição", "Diálogos"], correct: "Tese e argumentos" },
    { q: "Polissemia é quando uma palavra tem:", options: ["Um significado", "Vários significados", "Nenhum significado", "Som igual"], correct: "Vários significados" },
    { q: "Oração adjetiva é introduzida por:", options: ["Conjunção", "Pronome relativo", "Preposição", "Advérbio"], correct: "Pronome relativo" },
    { q: "Intertextualidade é a relação entre:", options: ["Palavras", "Textos", "Letras", "Números"], correct: "Textos" },
  ],
  historia: [
    { q: "A 1ª Guerra Mundial começou em:", options: ["1912", "1914", "1918", "1920"], correct: "1914" },
    { q: "A Revolução Russa ocorreu em:", options: ["1905", "1917", "1922", "1945"], correct: "1917" },
    { q: "A Crise de 1929 atingiu:", options: ["Só EUA", "O mundo todo", "Só Europa", "Só Ásia"], correct: "O mundo todo" },
    { q: "Getúlio Vargas governou o Estado Novo de:", options: ["1930-37", "1937-45", "1945-50", "1950-54"], correct: "1937-45" },
    { q: "O Holocausto foi perpetrado por:", options: ["Itália fascista", "Alemanha nazista", "URSS", "Japão"], correct: "Alemanha nazista" },
    { q: "AI-5 foi decretado na ditadura em:", options: ["1964", "1968", "1974", "1985"], correct: "1968" },
    { q: "A Constituição cidadã é de:", options: ["1946", "1967", "1988", "2002"], correct: "1988" },
    { q: "Guerra Fria opôs:", options: ["EUA × China", "EUA × URSS", "França × Inglaterra", "Brasil × Argentina"], correct: "EUA × URSS" },
  ],
  geografia: [
    { q: "IDH mede:", options: ["PIB apenas", "Desenvolvimento humano", "Área do país", "População"], correct: "Desenvolvimento humano" },
    { q: "Israel e Palestina disputam:", options: ["Petróleo", "Território", "Tecnologia", "Comida"], correct: "Território" },
    { q: "UE é um bloco econômico da:", options: ["América", "Ásia", "Europa", "África"], correct: "Europa" },
    { q: "Tigres Asiáticos são:", options: ["Animais", "Países emergentes da Ásia", "Times", "Nada"], correct: "Países emergentes da Ásia" },
    { q: "Multipolaridade = poder dividido entre:", options: ["2 países", "Vários países/blocos", "1 país", "Nenhum"], correct: "Vários países/blocos" },
    { q: "Apartheid ocorreu na:", options: ["Índia", "Brasil", "África do Sul", "China"], correct: "África do Sul" },
  ],
  ciencias: [
    { q: "Modelo atômico de Bohr inclui:", options: ["Bola de bilhar", "Pudim de passas", "Órbitas de elétrons", "Nuvem apenas"], correct: "Órbitas de elétrons" },
    { q: "MRU significa que a velocidade é:", options: ["Variável", "Constante", "Zero", "Negativa"], correct: "Constante" },
    { q: "F = m × a é qual lei de Newton?", options: ["1ª", "2ª", "3ª", "Nenhuma"], correct: "2ª" },
    { q: "Genótipo é:", options: ["Aparência", "Composição genética", "Comportamento", "Doença"], correct: "Composição genética" },
    { q: "Ligação covalente compartilha:", options: ["Prótons", "Elétrons", "Nêutrons", "Íons"], correct: "Elétrons" },
    { q: "Seleção natural foi proposta por:", options: ["Newton", "Einstein", "Darwin", "Mendel"], correct: "Darwin" },
  ],
  ingles: [
    { q: "Present Perfect: 'I ___ never been to Paris.'", options: ["has", "have", "had", "having"], correct: "have" },
    { q: "Second Conditional: 'If I ___ rich...'", options: ["am", "was", "were", "be"], correct: "were" },
    { q: "Reported Speech: 'She said she ___ tired.'", options: ["is", "was", "were", "be"], correct: "was" },
    { q: "Phrasal verb 'give up' means:", options: ["Dar", "Desistir", "Subir", "Correr"], correct: "Desistir" },
    { q: "'Already' is used with:", options: ["Simple Past", "Present Perfect", "Future", "Continuous"], correct: "Present Perfect" },
  ],
  logica: [
    { q: "Se x² = 64, x pode ser:", options: ["±6", "±7", "±8", "±9"], correct: "±8" },
    { q: "Probabilidade de cara numa moeda:", options: ["1/3", "1/4", "1/2", "1/6"], correct: "1/2" },
    { q: "Se todos A são B, e C não é B:", options: ["C é A", "C não é A", "C pode ser A", "Nada"], correct: "C não é A" },
  ],
  fisica: [
    { q: "Unidade de energia no SI:", options: ["Newton", "Joule", "Watt", "Pascal"], correct: "Joule" },
    { q: "Potência = Trabalho ÷", options: ["Massa", "Tempo", "Força", "Área"], correct: "Tempo" },
    { q: "Conservação de energia: Ec + Ep =", options: ["Variável", "Constante", "Zero", "Infinito"], correct: "Constante" },
  ],
  quimica: [
    { q: "Reação de combustão produz:", options: ["Água e CO₂", "Sal e água", "Ácido", "Base"], correct: "Água e CO₂" },
    { q: "Balanceamento conserva:", options: ["Energia", "Massa (átomos)", "Cor", "Volume"], correct: "Massa (átomos)" },
    { q: "Ligação metálica ocorre entre:", options: ["Não-metais", "Metais", "Metal e não-metal", "Gases"], correct: "Metais" },
  ],
  biologia: [
    { q: "DNA significa:", options: ["Ácido desoxirribonucleico", "Ácido dinitrogênico", "Átomo dinuclear", "Nenhuma"], correct: "Ácido desoxirribonucleico" },
    { q: "Mitocôndria é responsável por:", options: ["Digestão", "Respiração celular", "Fotossíntese", "Reprodução"], correct: "Respiração celular" },
    { q: "Cromossomos humanos:", options: ["23", "44", "46", "48"], correct: "46" },
  ],
  filosofia: [
    { q: "Existencialismo: 'A existência precede a...'", options: ["Morte", "Essência", "Vida", "Razão"], correct: "Essência" },
  ],
  sociologia: [
    { q: "Globalização cultural é a:", options: ["Isolação", "Troca cultural mundial", "Só internet", "Nada"], correct: "Troca cultural mundial" },
  ],
  arte: [
    { q: "Semana de 22 foi um marco do:", options: ["Barroco", "Romantismo", "Modernismo", "Classicismo"], correct: "Modernismo" },
  ],
  "educacao-fisica": [
    { q: "Yoga trabalha:", options: ["Só força", "Corpo e mente", "Só velocidade", "Só resistência"], correct: "Corpo e mente" },
  ],
};

const QUESTIONS_1EM: Record<string, Question[]> = {
  matematica: [
    { q: "log₂(8) =", options: ["2", "3", "4", "8"], correct: "3" },
    { q: "PA: a₁=2, r=3. a₅=?", options: ["11", "14", "17", "20"], correct: "14" },
    { q: "PG: a₁=3, q=2. a₄=?", options: ["12", "18", "24", "48"], correct: "24" },
    { q: "Domínio de f(x)=√(x-2):", options: ["x≥0", "x≥2", "x>2", "x≤2"], correct: "x≥2" },
    { q: "f(x)=x²-4x+3, raízes:", options: ["1 e 3", "2 e 3", "-1 e -3", "0 e 4"], correct: "1 e 3" },
    { q: "2³ˣ = 64, x=?", options: ["1", "2", "3", "4"], correct: "2" },
    { q: "Vértice de f(x)=x²-6x+8: x_v=", options: ["2", "3", "4", "6"], correct: "3" },
    { q: "A∩B (interseção) significa:", options: ["União", "Elementos comuns", "Diferença", "Vazio"], correct: "Elementos comuns" },
    { q: "Sen(90°) =", options: ["0", "1/2", "√2/2", "1"], correct: "1" },
    { q: "Lei dos cossenos generaliza:", options: ["Bhaskara", "Pitágoras", "Tales", "Newton"], correct: "Pitágoras" },
  ],
  portugues: [
    { q: "Trovadorismo: cantigas de amor eram feitas por:", options: ["Mulheres", "Trovadores", "Reis", "Padres"], correct: "Trovadores" },
    { q: "Camões escreveu:", options: ["O Guarani", "Os Lusíadas", "Macunaíma", "Dom Casmurro"], correct: "Os Lusíadas" },
    { q: "Barroco é marcado por:", options: ["Simplicidade", "Conflito e dualidade", "Razão", "Minimalismo"], correct: "Conflito e dualidade" },
    { q: "Gregório de Matos é do:", options: ["Arcadismo", "Barroco", "Romantismo", "Modernismo"], correct: "Barroco" },
    { q: "Formação de palavras por derivação:", options: ["guarda-chuva", "infeliz", "girassol", "planalto"], correct: "infeliz" },
    { q: "Função referencial da linguagem:", options: ["Expressa emoções", "Informa objetivamente", "Convence", "É poética"], correct: "Informa objetivamente" },
  ],
  fisica: [
    { q: "No MRU, a aceleração é:", options: ["Variável", "Constante ≠0", "Zero", "Negativa"], correct: "Zero" },
    { q: "F = ma. Se m=5kg e a=2m/s², F=?", options: ["7N", "10N", "2,5N", "3N"], correct: "10N" },
    { q: "No MRUV, v = v₀ + at. Se v₀=0, a=10, t=3:", options: ["13", "30", "33", "10"], correct: "30" },
    { q: "Empuxo depende de:", options: ["Cor", "Densidade do fluido e volume", "Temperatura apenas", "Nada"], correct: "Densidade do fluido e volume" },
    { q: "Energia cinética: Ec = ½mv². Se m=2, v=3:", options: ["6J", "9J", "12J", "18J"], correct: "9J" },
    { q: "3ª Lei de Newton: ação e:", options: ["Inércia", "Reação", "Aceleração", "Gravidade"], correct: "Reação" },
    { q: "Queda livre: a=g≈10m/s². Após 2s, v=?", options: ["10m/s", "20m/s", "30m/s", "40m/s"], correct: "20m/s" },
    { q: "Pressão hidrostática depende de:", options: ["Cor do líquido", "Profundidade", "Largura", "Nada"], correct: "Profundidade" },
  ],
  quimica: [
    { q: "Número atômico define:", options: ["Massa", "Prótons", "Nêutrons", "Elétrons de valência"], correct: "Prótons" },
    { q: "Geometria molecular do H₂O:", options: ["Linear", "Angular", "Trigonal", "Tetraédrica"], correct: "Angular" },
    { q: "Ácido forte:", options: ["H₂CO₃", "HCl", "CH₃COOH", "H₃BO₃"], correct: "HCl" },
    { q: "Mol contém quantas entidades?", options: ["6×10²¹", "6×10²³", "6×10²⁵", "6×10²⁰"], correct: "6×10²³" },
    { q: "Ligação covalente polar ocorre entre átomos de:", options: ["Mesma eletronegatividade", "Diferente eletroneg.", "Metais", "Gases nobres"], correct: "Diferente eletroneg." },
    { q: "Lei de Lavoisier:", options: ["Energia se conserva", "Massa se conserva", "Volume se conserva", "Nada se conserva"], correct: "Massa se conserva" },
  ],
  biologia: [
    { q: "Mitose produz:", options: ["4 células", "2 células iguais", "1 célula", "8 células"], correct: "2 células iguais" },
    { q: "Fotossíntese ocorre no:", options: ["Mitocôndria", "Cloroplasto", "Ribossomo", "Lisossomo"], correct: "Cloroplasto" },
    { q: "Tecido que reveste o corpo:", options: ["Conjuntivo", "Epitelial", "Muscular", "Nervoso"], correct: "Epitelial" },
    { q: "Respiração celular produz:", options: ["Glicose", "ATP", "Amido", "Proteína"], correct: "ATP" },
    { q: "Meiose produz:", options: ["2 células iguais", "4 células diferentes", "1 célula", "8 células"], correct: "4 células diferentes" },
  ],
  historia: [
    { q: "Feudalismo era baseado em:", options: ["Indústria", "Terra e fidelidade", "Comércio", "Tecnologia"], correct: "Terra e fidelidade" },
    { q: "Reforma Protestante: Lutero fixou as:", options: ["85 teses", "95 teses", "105 teses", "50 teses"], correct: "95 teses" },
    { q: "Renascimento valorizava:", options: ["Teocentrismo", "Antropocentrismo", "Feudalismo", "Absolutismo"], correct: "Antropocentrismo" },
    { q: "Cruzadas foram expedições:", options: ["Comerciais", "Militares-religiosas", "Científicas", "Artísticas"], correct: "Militares-religiosas" },
    { q: "Colonização do Brasil: primeiro produto:", options: ["Café", "Ouro", "Pau-brasil", "Açúcar"], correct: "Pau-brasil" },
  ],
  geografia: [
    { q: "Tectônica de placas causa:", options: ["Chuva", "Terremotos e vulcões", "Ventos", "Marés"], correct: "Terremotos e vulcões" },
    { q: "El Niño é um fenômeno:", options: ["Vulcânico", "Climático oceânico", "Sísmico", "Espacial"], correct: "Climático oceânico" },
    { q: "SIG significa:", options: ["Sistema de Info. Geográfica", "Serviço de Internet", "Sinal de GPS", "Satélite"], correct: "Sistema de Info. Geográfica" },
    { q: "Energia eólica vem do:", options: ["Sol", "Vento", "Água", "Átomo"], correct: "Vento" },
    { q: "Agenda 2030 é da:", options: ["OMS", "ONU", "OMC", "FMI"], correct: "ONU" },
  ],
  ingles: [
    { q: "Mixed Conditional: 'If I had studied, I ___ pass.'", options: ["will", "would", "can", "may"], correct: "would" },
    { q: "'False friend': 'actually' means:", options: ["Atualmente", "Na verdade", "Realmente", "Atuação"], correct: "Na verdade" },
    { q: "Prefix 'un-' means:", options: ["More", "Again", "Not", "Before"], correct: "Not" },
    { q: "Academic writing should be:", options: ["Informal", "Formal and objective", "Poetic", "Short only"], correct: "Formal and objective" },
  ],
  logica: [
    { q: "Princípio da contagem: 3 camisas × 4 calças =", options: ["7", "12", "3", "4"], correct: "12" },
    { q: "P(6) em um dado justo:", options: ["1/2", "1/3", "1/6", "1/4"], correct: "1/6" },
    { q: "Se p→q e ¬q, então:", options: ["p", "¬p", "q", "Nada"], correct: "¬p" },
  ],
  filosofia: [
    { q: "Sócrates usava o método:", options: ["Científico", "Maiêutico", "Empírico", "Dedutivo"], correct: "Maiêutico" },
    { q: "Alegoria da Caverna é de:", options: ["Aristóteles", "Platão", "Sócrates", "Tales"], correct: "Platão" },
    { q: "Silogismo foi criado por:", options: ["Platão", "Sócrates", "Aristóteles", "Heráclito"], correct: "Aristóteles" },
  ],
  sociologia: [
    { q: "Émile Durkheim criou o conceito de:", options: ["Mais-valia", "Fato social", "Capital", "Ação social"], correct: "Fato social" },
    { q: "Karl Marx analisou:", options: ["Religião", "Luta de classes", "Psicologia", "Biologia"], correct: "Luta de classes" },
  ],
  arte: [
    { q: "Impressionismo: pintor famoso:", options: ["Da Vinci", "Monet", "Picasso", "Dalí"], correct: "Monet" },
    { q: "Cubismo foi criado por:", options: ["Monet", "Picasso", "Van Gogh", "Renoir"], correct: "Picasso" },
  ],
  "educacao-fisica": [
    { q: "Biomecânica estuda:", options: ["Química", "Movimento do corpo", "Células", "Nutrição"], correct: "Movimento do corpo" },
  ],
};

const QUESTIONS_2EM: Record<string, Question[]> = {
  matematica: [
    { q: "C(5,2) =", options: ["5", "10", "15", "20"], correct: "10" },
    { q: "Determinante de [[1,2],[3,4]] =", options: ["-2", "2", "10", "-10"], correct: "-2" },
    { q: "P(4) = 4! =", options: ["12", "16", "24", "48"], correct: "24" },
    { q: "Volume do cilindro: V = πr²h. r=2, h=5:", options: ["10π", "20π", "40π", "25π"], correct: "20π" },
    { q: "Binômio: (x+1)² =", options: ["x²+1", "x²+2x+1", "x²+x+1", "2x²+1"], correct: "x²+2x+1" },
    { q: "Arranjo A(4,2) =", options: ["6", "8", "12", "24"], correct: "12" },
    { q: "Prisma reto: V = Ab × h. Ab=12, h=5:", options: ["17", "60", "72", "120"], correct: "60" },
    { q: "Probabilidade condicional P(A|B):", options: ["P(A∩B)/P(B)", "P(A)+P(B)", "P(A)×P(B)", "P(A)/P(B)"], correct: "P(A∩B)/P(B)" },
  ],
  portugues: [
    { q: "Romantismo: autor de 'O Guarani':", options: ["Machado", "Alencar", "Drummond", "Lobato"], correct: "Alencar" },
    { q: "Realismo: 'Dom Casmurro' é de:", options: ["Alencar", "Machado de Assis", "Clarice", "Rosa"], correct: "Machado de Assis" },
    { q: "Naturalismo se diferencia do Realismo por:", options: ["Idealismo", "Determinismo e cientificismo", "Religiosidade", "Poesia"], correct: "Determinismo e cientificismo" },
    { q: "Parnasianismo valoriza:", options: ["Emoção", "Forma perfeita", "Liberdade total", "Oralidade"], correct: "Forma perfeita" },
    { q: "Simbolismo valoriza:", options: ["Razão", "Musicalidade e sugestão", "Ciência", "Descrição"], correct: "Musicalidade e sugestão" },
    { q: "Quem escreveu 'Memórias Póstumas de Brás Cubas'?", options: ["Alencar", "Machado de Assis", "Graciliano", "Lobato"], correct: "Machado de Assis" },
  ],
  fisica: [
    { q: "1ª Lei da Termodinâmica:", options: ["ΔU=Q-W", "F=ma", "E=mc²", "V=IR"], correct: "ΔU=Q-W" },
    { q: "Espelho côncavo: objeto antes de C forma imagem:", options: ["Virtual", "Real e menor", "Real e maior", "Não forma"], correct: "Real e menor" },
    { q: "Lei de Snell: n₁sen θ₁ = n₂sen θ₂ é sobre:", options: ["Reflexão", "Refração", "Difração", "Absorção"], correct: "Refração" },
    { q: "Frequência × comprimento de onda =", options: ["Energia", "Velocidade", "Potência", "Pressão"], correct: "Velocidade" },
    { q: "Efeito Doppler muda a ___ percebida:", options: ["Cor", "Frequência", "Massa", "Forma"], correct: "Frequência" },
    { q: "Máquina térmica ideal: ciclo de:", options: ["Newton", "Carnot", "Ohm", "Faraday"], correct: "Carnot" },
  ],
  quimica: [
    { q: "Concentração mol/L: 1 mol em 500mL =", options: ["0,5M", "1M", "2M", "4M"], correct: "2M" },
    { q: "Lei de Hess: entalpia depende de:", options: ["Caminho", "Estado inicial e final", "Velocidade", "Cor"], correct: "Estado inicial e final" },
    { q: "pH < 7 indica solução:", options: ["Neutra", "Ácida", "Básica", "Tampão"], correct: "Ácida" },
    { q: "Equilíbrio: Le Chatelier prevê:", options: ["Reação parar", "Deslocamento do equilíbrio", "Explosão", "Nada"], correct: "Deslocamento do equilíbrio" },
    { q: "Pilha gera energia por reação:", options: ["Nuclear", "Oxirredução", "Ácido-base", "Precipitação"], correct: "Oxirredução" },
    { q: "Meia-vida é o tempo para:", options: ["Dobrar massa", "Metade decair", "Reagir todo", "Nada"], correct: "Metade decair" },
  ],
  biologia: [
    { q: "Taxonomia: a menor unidade é:", options: ["Reino", "Espécie", "Filo", "Classe"], correct: "Espécie" },
    { q: "Vírus são considerados:", options: ["Vivos", "Não-vivos", "Na fronteira da vida", "Plantas"], correct: "Na fronteira da vida" },
    { q: "Fotossíntese nas plantas ocorre na:", options: ["Raiz", "Folha", "Caule", "Flor"], correct: "Folha" },
    { q: "Artrópodes têm:", options: ["Ossos", "Exoesqueleto", "Escamas", "Penas"], correct: "Exoesqueleto" },
    { q: "Sistema imunológico produz:", options: ["Hormônios", "Anticorpos", "Enzimas digestivas", "Bile"], correct: "Anticorpos" },
  ],
  historia: [
    { q: "Iluminismo defendia:", options: ["Monarquia absoluta", "Razão e liberdade", "Feudalismo", "Escravidão"], correct: "Razão e liberdade" },
    { q: "Revolução Industrial: máquina a vapor usava:", options: ["Eletricidade", "Carvão", "Petróleo", "Nuclear"], correct: "Carvão" },
    { q: "Independência do Brasil: grito do Ipiranga:", options: ["1808", "1815", "1822", "1889"], correct: "1822" },
    { q: "Abolição no Brasil: 1888 com:", options: ["Lei Eusébio", "Lei Áurea", "Lei do Ventre", "Lei Saraiva"], correct: "Lei Áurea" },
    { q: "Imperialismo na África: Conferência de:", options: ["Viena", "Berlim", "Paris", "Londres"], correct: "Berlim" },
  ],
  geografia: [
    { q: "Transição demográfica: fase 3 tem:", options: ["Alta natalidade", "Baixa natalidade e mortalidade", "Alta mortalidade", "Explosão"], correct: "Baixa natalidade e mortalidade" },
    { q: "Indústria 4.0 usa:", options: ["Apenas máquinas", "IoT e inteligência artificial", "Só humanos", "Nada novo"], correct: "IoT e inteligência artificial" },
    { q: "BRICS inclui:", options: ["Brasil, Rússia, Índia, China, África do Sul", "Só Brasil", "EUA e Europa", "Nenhum"], correct: "Brasil, Rússia, Índia, China, África do Sul" },
    { q: "Megacidade tem mais de:", options: ["1 milhão", "5 milhões", "10 milhões", "50 milhões"], correct: "10 milhões" },
  ],
  ingles: [
    { q: "Verb tenses: Past Perfect: 'had + ___'", options: ["Base form", "Past participle", "Gerund", "Infinitive"], correct: "Past participle" },
    { q: "'Collocation': 'make a ___'", options: ["homework", "mistake", "exam", "sport"], correct: "mistake" },
    { q: "'Despite' is followed by:", options: ["Verb", "Noun/gerund", "Adjective", "Adverb"], correct: "Noun/gerund" },
  ],
  logica: [
    { q: "C(10,3) = 10!/(3!×7!) =", options: ["30", "60", "120", "720"], correct: "120" },
    { q: "Prob. de 2 moedas = 2 caras:", options: ["1/2", "1/3", "1/4", "1/8"], correct: "1/4" },
  ],
  filosofia: [
    { q: "Descartes: 'Penso, logo...'", options: ["Durmo", "Existo", "Sei", "Posso"], correct: "Existo" },
    { q: "Kant escreveu Crítica da Razão:", options: ["Pura", "Prática", "Ambas", "Nenhuma"], correct: "Pura" },
    { q: "Maquiavel escreveu:", options: ["O Príncipe", "Leviatã", "República", "Utopia"], correct: "O Príncipe" },
  ],
  sociologia: [
    { q: "Weber criou o conceito de:", options: ["Fato social", "Ação social", "Mais-valia", "Anomia"], correct: "Ação social" },
    { q: "Indústria cultural foi conceito de:", options: ["Marx", "Adorno e Horkheimer", "Weber", "Durkheim"], correct: "Adorno e Horkheimer" },
  ],
  arte: [
    { q: "Surrealismo: artista famoso:", options: ["Monet", "Dalí", "Picasso", "Renoir"], correct: "Dalí" },
  ],
  "educacao-fisica": [
    { q: "Periodização do treino divide em:", options: ["Dias", "Macrociclos e microciclos", "Apenas semanas", "Nada"], correct: "Macrociclos e microciclos" },
  ],
};

const QUESTIONS_3EM: Record<string, Question[]> = {
  matematica: [
    { q: "Distância entre A(1,2) e B(4,6):", options: ["3", "4", "5", "7"], correct: "5" },
    { q: "Equação da reta: y=2x+3. Coeficiente angular:", options: ["2", "3", "5", "1"], correct: "2" },
    { q: "Circunferência: (x-1)²+(y-2)²=9. Raio=", options: ["1", "2", "3", "9"], correct: "3" },
    { q: "i² (número imaginário) =", options: ["1", "-1", "i", "0"], correct: "-1" },
    { q: "Variância mede:", options: ["Média", "Dispersão dos dados", "Frequência", "Moda"], correct: "Dispersão dos dados" },
    { q: "Desvio padrão é a raiz da:", options: ["Média", "Moda", "Variância", "Mediana"], correct: "Variância" },
    { q: "Equação da elipse tem:", options: ["1 foco", "2 focos", "3 focos", "0 focos"], correct: "2 focos" },
    { q: "Polinômio grau 3 tem no máximo:", options: ["1 raiz", "2 raízes", "3 raízes", "4 raízes"], correct: "3 raízes" },
  ],
  portugues: [
    { q: "Modernismo 1ª fase: Oswald escreveu:", options: ["Macunaíma", "Pau-Brasil", "Vidas Secas", "Iracema"], correct: "Pau-Brasil" },
    { q: "Graciliano Ramos escreveu:", options: ["Grande Sertão", "Vidas Secas", "Macunaíma", "O Cortiço"], correct: "Vidas Secas" },
    { q: "Guimarães Rosa escreveu:", options: ["Vidas Secas", "Grande Sertão: Veredas", "Dom Casmurro", "Iracema"], correct: "Grande Sertão: Veredas" },
    { q: "Competência 5 da redação ENEM:", options: ["Norma culta", "Repertório", "Argumentação", "Proposta de intervenção"], correct: "Proposta de intervenção" },
    { q: "Clarice Lispector é conhecida por:", options: ["Prosa regionalista", "Fluxo de consciência", "Poesia concreta", "Cordel"], correct: "Fluxo de consciência" },
    { q: "Concretismo valoriza:", options: ["Forma visual do poema", "Rima", "Narrativa", "Crônica"], correct: "Forma visual do poema" },
  ],
  fisica: [
    { q: "Lei de Coulomb: F ∝ q₁q₂/d². Se d dobra, F:", options: ["Dobra", "Divide por 4", "Divide por 2", "Quadruplica"], correct: "Divide por 4" },
    { q: "V = R × I é a Lei de:", options: ["Newton", "Ohm", "Faraday", "Coulomb"], correct: "Ohm" },
    { q: "Potência elétrica P = V × I. V=220, I=5:", options: ["44W", "225W", "1100W", "440W"], correct: "1100W" },
    { q: "Indução eletromagnética: Lei de:", options: ["Newton", "Ohm", "Faraday", "Coulomb"], correct: "Faraday" },
    { q: "E = mc²: relação massa-energia de:", options: ["Newton", "Bohr", "Einstein", "Faraday"], correct: "Einstein" },
    { q: "Efeito fotoelétrico provou que luz é:", options: ["Só onda", "Só partícula", "Onda e partícula", "Nenhum"], correct: "Onda e partícula" },
    { q: "Fissão nuclear = núcleo se:", options: ["Une", "Divide", "Desaparece", "Aumenta"], correct: "Divide" },
  ],
  quimica: [
    { q: "Hidrocarboneto com tripla ligação:", options: ["Alcano", "Alceno", "Alcino", "Aromático"], correct: "Alcino" },
    { q: "Grupo funcional -OH é de:", options: ["Aldeído", "Álcool", "Ácido", "Cetona"], correct: "Álcool" },
    { q: "Isomeria óptica requer carbono:", options: ["Simétrico", "Assimétrico (quiral)", "Linear", "Dupla lig."], correct: "Assimétrico (quiral)" },
    { q: "Polímero de adição: exemplo:", options: ["Náilon", "Polietileno", "Poliéster", "Baquelite"], correct: "Polietileno" },
    { q: "Benzeno é um:", options: ["Alcano", "Alceno", "Aromático", "Alcino"], correct: "Aromático" },
    { q: "Reação de saponificação produz:", options: ["Álcool e ácido", "Sabão e glicerol", "Éster e água", "Polímero"], correct: "Sabão e glicerol" },
  ],
  biologia: [
    { q: "1ª Lei de Mendel: segregação dos:", options: ["Cromossomos", "Alelos", "Genes ligados", "RNA"], correct: "Alelos" },
    { q: "Sistema ABO: tipo O é doador:", options: ["Só para O", "Universal", "Só para A", "Só para AB"], correct: "Universal" },
    { q: "CRISPR é uma técnica de:", options: ["Microscopia", "Edição genética", "Clonagem", "PCR"], correct: "Edição genética" },
    { q: "Especiação alopátrica ocorre por:", options: ["Mutação", "Isolamento geográfico", "Seleção sexual", "Migração"], correct: "Isolamento geográfico" },
    { q: "Hardy-Weinberg assume população em:", options: ["Evolução", "Equilíbrio", "Extinção", "Crescimento"], correct: "Equilíbrio" },
  ],
  historia: [
    { q: "Muro de Berlim caiu em:", options: ["1985", "1989", "1991", "2001"], correct: "1989" },
    { q: "URSS se dissolveu em:", options: ["1985", "1989", "1991", "2000"], correct: "1991" },
    { q: "Ditadura militar no Brasil: 1964 a:", options: ["1978", "1982", "1985", "1988"], correct: "1985" },
    { q: "New Deal foi política de:", options: ["Churchill", "Roosevelt", "Truman", "Kennedy"], correct: "Roosevelt" },
    { q: "Bomba atômica: Hiroshima em:", options: ["1943", "1944", "1945", "1946"], correct: "1945" },
    { q: "Guerra do Vietnã envolveu:", options: ["EUA × China", "EUA × Vietnã do Norte", "URSS × Japão", "França × Inglaterra"], correct: "EUA × Vietnã do Norte" },
  ],
  geografia: [
    { q: "ODS = Objetivos de Desenvolvimento:", options: ["Social", "Sustentável", "Simples", "Superior"], correct: "Sustentável" },
    { q: "Ciberespaço refere-se a:", options: ["Oceanos", "Mundo digital/internet", "Espaço sideral", "Nada"], correct: "Mundo digital/internet" },
    { q: "Desigualdade regional no Brasil: região mais rica:", options: ["Norte", "Nordeste", "Sudeste", "Sul"], correct: "Sudeste" },
    { q: "Acordo de Paris (2015) trata de:", options: ["Comércio", "Clima", "Migração", "Guerra"], correct: "Clima" },
  ],
  ingles: [
    { q: "ENEM: 'Although' is a:", options: ["Addition word", "Contrast word", "Cause word", "Time word"], correct: "Contrast word" },
    { q: "'Sustainability' relates to:", options: ["Fashion", "Environment", "Sports", "Music"], correct: "Environment" },
    { q: "Critical reading: 'bias' means:", options: ["Truth", "Prejudice/tendency", "Fact", "Evidence"], correct: "Prejudice/tendency" },
  ],
  logica: [
    { q: "Se P(A)=0,3 e P(B)=0,4 (indep.), P(A∩B)=", options: ["0,7", "0,12", "0,1", "0,34"], correct: "0,12" },
    { q: "Desvio padrão alto indica dados:", options: ["Próximos da média", "Dispersos", "Iguais", "Nulos"], correct: "Dispersos" },
  ],
  filosofia: [
    { q: "Foucault estudou relações de:", options: ["Amor", "Poder e saber", "Amizade", "Trabalho"], correct: "Poder e saber" },
    { q: "Hannah Arendt escreveu sobre:", options: ["A banalidade do mal", "O Príncipe", "Crítica da Razão", "Leviatã"], correct: "A banalidade do mal" },
    { q: "Karl Popper: critério de demarcação:", options: ["Verificação", "Falsificabilidade", "Intuição", "Tradição"], correct: "Falsificabilidade" },
  ],
  sociologia: [
    { q: "Fake news é um desafio da:", options: ["Economia", "Democracia digital", "Saúde", "Educação física"], correct: "Democracia digital" },
    { q: "Neoliberalismo defende:", options: ["Estado forte", "Menos intervenção estatal", "Socialismo", "Comunismo"], correct: "Menos intervenção estatal" },
  ],
  arte: [
    { q: "Hélio Oiticica criou os:", options: ["Parangolés", "Ready-mades", "Vitrais", "Afrescos"], correct: "Parangolés" },
  ],
  "educacao-fisica": [
    { q: "Esporte paralímpico é voltado para:", options: ["Profissionais", "Pessoas com deficiência", "Crianças", "Idosos"], correct: "Pessoas com deficiência" },
  ],
};

// Main export: grade-specific questions
export const QUESTIONS_BY_GRADE: Record<string, Record<string, Question[]>> = {
  "6ano": QUESTIONS_6ANO,
  "7ano": QUESTIONS_7ANO,
  "8ano": QUESTIONS_8ANO,
  "9ano": QUESTIONS_9ANO,
  "1em": QUESTIONS_1EM,
  "2em": QUESTIONS_2EM,
  "3em": QUESTIONS_3EM,
};

// Legacy fallback (keeps backward compat)
export const SAMPLE_QUESTIONS_BY_SUBJECT: Record<string, Question[]> = QUESTIONS_1EM;

// Helper to get questions for a specific grade and subject
export function getQuestionsForGradeSubject(grade: string, subject: string): Question[] {
  const gradeQuestions = QUESTIONS_BY_GRADE[grade];
  if (!gradeQuestions) return QUESTIONS_1EM[subject] || [];
  const questions = gradeQuestions[subject];
  if (!questions || questions.length === 0) {
    // Fallback: try closest grade
    return QUESTIONS_1EM[subject] || [];
  }
  return questions;
}
