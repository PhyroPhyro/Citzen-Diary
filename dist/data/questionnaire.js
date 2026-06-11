"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHARACTER_QUESTIONS = void 0;
exports.calculateTraits = calculateTraits;
exports.CHARACTER_QUESTIONS = [
    {
        id: 1,
        text: 'Uma estrada bifurca à sua frente. Um caminho você já percorreu antes. O outro, nunca. O dia está fechando. O que ele faz?',
        primaryTrait: 'openness',
        options: [
            { letter: 'A', text: 'Segue o caminho conhecido. Chegar com segurança vale mais que a curiosidade.', primaryValue: 1 },
            { letter: 'B', text: 'Observa o caminho novo por um momento, mas segue o familiar. Não é hora de arriscar.', primaryValue: 3 },
            { letter: 'C', text: 'Segue o caminho novo. Se der errado, ao menos terá algo para contar.', primaryValue: 7 },
            { letter: 'D', text: 'Segue o caminho novo sem hesitar. O conhecido já foi vivido.', primaryValue: 9 },
        ],
    },
    {
        id: 2,
        text: 'Ele fecha um acordo com um comerciante para entregar algo em três dias. No segundo dia, surge uma oportunidade melhor que o faria quebrar o compromisso. O que ele faz?',
        primaryTrait: 'conscientiousness',
        options: [
            { letter: 'A', text: 'Abandona o acordo. Oportunidades não esperam.', primaryValue: 1 },
            { letter: 'B', text: 'Tenta negociar com o comerciante antes de decidir.', primaryValue: 4 },
            { letter: 'C', text: 'Cumpre o acordo, mas guarda a oportunidade para depois.', primaryValue: 7 },
            { letter: 'D', text: 'Cumpre o acordo sem pensar duas vezes. A palavra dada é sagrada.', primaryValue: 9 },
        ],
    },
    {
        id: 3,
        text: 'Ele chega a uma cidade que não conhece. A praça central está cheia de gente. O que ele faz primeiro?',
        primaryTrait: 'extraversion',
        options: [
            { letter: 'A', text: 'Procura um lugar quieto para observar antes de qualquer coisa.', primaryValue: 1 },
            { letter: 'B', text: 'Caminha pela praça em silêncio, absorvendo o ambiente.', primaryValue: 3 },
            { letter: 'C', text: 'Para em alguma barraca e puxa conversa com quem estiver por perto.', primaryValue: 7 },
            { letter: 'D', text: 'Busca o lugar mais movimentado e se apresenta.', primaryValue: 9 },
        ],
    },
    {
        id: 4,
        text: 'Algo que ele planejou por semanas dá errado no último momento. A culpa não é dele. O que acontece por dentro?',
        primaryTrait: 'emotionalStability',
        options: [
            { letter: 'A', text: 'Uma tempestade. Ele precisa de tempo e silêncio para se recompor.', primaryValue: 1 },
            { letter: 'B', text: 'Frustração real, mas passa em algumas horas.', primaryValue: 4 },
            { letter: 'C', text: 'Decepção breve. Logo está pensando no próximo passo.', primaryValue: 7 },
            { letter: 'D', text: 'Quase nada. Planos falham. O que importa é o que vem depois.', primaryValue: 9 },
        ],
    },
    {
        id: 5,
        text: 'Um estranho pede ajuda numa tarefa que vai custar algumas horas do seu dia. Ele não tem nada a oferecer em troca. O que ele faz?',
        primaryTrait: 'agreeableness',
        options: [
            { letter: 'A', text: 'Recusa. Tempo é escasso e estranhos, imprevisíveis.', primaryValue: 1 },
            { letter: 'B', text: 'Pergunta o que é antes de decidir.', primaryValue: 4 },
            { letter: 'C', text: 'Ajuda, mas deixa claro que tem outros compromissos logo.', primaryValue: 7 },
            { letter: 'D', text: 'Ajuda sem hesitar. Alguém precisou pedir — isso já é o suficiente.', primaryValue: 9 },
        ],
    },
    {
        id: 6,
        text: 'Ele descobre uma técnica diferente para algo que já faz bem há anos. A nova forma é incerta, mas promissora. O que ele faz?',
        primaryTrait: 'openness',
        secondaryTrait: 'conscientiousness',
        options: [
            { letter: 'A', text: 'Ignora. O que funciona não precisa mudar.', primaryValue: 1, secondaryEffect: { trait: 'conscientiousness', value: 1 } },
            { letter: 'B', text: 'Estuda a nova técnica, mas continua com a antiga por enquanto.', primaryValue: 4 },
            { letter: 'C', text: 'Experimenta a nova técnica em situações de baixo risco.', primaryValue: 7 },
            { letter: 'D', text: 'Abandona a antiga e mergulha na nova. Aprender exige risco.', primaryValue: 9, secondaryEffect: { trait: 'conscientiousness', value: -1 } },
        ],
    },
    {
        id: 7,
        text: 'Ele tem um dia livre, sem obrigações. Como ele passa?',
        primaryTrait: 'conscientiousness',
        secondaryTrait: 'extraversion',
        options: [
            { letter: 'A', text: 'Sem plano. Vai para onde o dia levar.', primaryValue: 1, secondaryEffect: { trait: 'extraversion', value: 1 } },
            { letter: 'B', text: 'Descansa, mas acaba preenchendo o tempo com pequenas tarefas.', primaryValue: 4 },
            { letter: 'C', text: 'Organiza as pendências que foram acumulando.', primaryValue: 7 },
            { letter: 'D', text: 'Prepara um plano detalhado para aproveitar cada hora.', primaryValue: 9, secondaryEffect: { trait: 'extraversion', value: -1 } },
        ],
    },
    {
        id: 8,
        text: 'Há um conflito entre dois conhecidos seus. Ambos vieram falar separadamente com ele. O que ele faz?',
        primaryTrait: 'extraversion',
        secondaryTrait: 'agreeableness',
        options: [
            { letter: 'A', text: 'Ouve os dois, mas não se envolve. Não é problema seu.', primaryValue: 1, secondaryEffect: { trait: 'agreeableness', value: -1 } },
            { letter: 'B', text: 'Ouve com atenção, mas evita tomar partido.', primaryValue: 4, secondaryEffect: { trait: 'agreeableness', value: 1 } },
            { letter: 'C', text: 'Ouve os dois e tenta ajudar a mediar.', primaryValue: 7, secondaryEffect: { trait: 'agreeableness', value: 1 } },
            { letter: 'D', text: 'Reúne os dois e propõe resolver na hora, juntos.', primaryValue: 9, secondaryEffect: { trait: 'agreeableness', value: 1 } },
        ],
    },
    {
        id: 9,
        text: 'Ele está num lugar desconhecido, sozinho, sem saber exatamente o que fazer a seguir. Como ele se sente?',
        primaryTrait: 'emotionalStability',
        secondaryTrait: 'openness',
        options: [
            { letter: 'A', text: 'Inquieto. A incerteza pesa e ele precisa de uma direção logo.', primaryValue: 1, secondaryEffect: { trait: 'openness', value: -1 } },
            { letter: 'B', text: 'Um pouco desconfortável, mas funcional.', primaryValue: 4 },
            { letter: 'C', text: 'Tranquilo. Incerteza é só o começo de algo.', primaryValue: 7, secondaryEffect: { trait: 'openness', value: 1 } },
            { letter: 'D', text: 'Em paz. Lugares assim são onde as coisas interessantes costumam começar.', primaryValue: 9, secondaryEffect: { trait: 'openness', value: 1 } },
        ],
    },
    {
        id: 10,
        text: 'Alguém que ele respeita diz algo que ele sabe que está errado. Na frente de outros. O que ele faz?',
        primaryTrait: 'agreeableness',
        secondaryTrait: 'emotionalStability',
        options: [
            { letter: 'A', text: 'Corrige na hora, claramente. O erro precisa ser apontado.', primaryValue: 1, secondaryEffect: { trait: 'emotionalStability', value: 1 } },
            { letter: 'B', text: 'Fica quieto no momento, mas fala depois em particular.', primaryValue: 4 },
            { letter: 'C', text: 'Levanta a dúvida com cuidado, sem expor diretamente.', primaryValue: 7 },
            { letter: 'D', text: 'Deixa passar. A relação vale mais que ter razão.', primaryValue: 9, secondaryEffect: { trait: 'emotionalStability', value: -1 } },
        ],
    },
];
function calculateTraits(answers) {
    const scores = {
        openness: { primary: 0, secondary: 0 },
        conscientiousness: { primary: 0, secondary: 0 },
        extraversion: { primary: 0, secondary: 0 },
        emotionalStability: { primary: 0, secondary: 0 },
        agreeableness: { primary: 0, secondary: 0 },
    };
    for (const answer of answers) {
        const question = exports.CHARACTER_QUESTIONS.find((q) => q.id === answer.questionId);
        if (!question)
            continue;
        const option = question.options.find((o) => o.letter === answer.optionLetter);
        if (!option)
            continue;
        scores[question.primaryTrait].primary += option.primaryValue;
        if (option.secondaryEffect) {
            scores[option.secondaryEffect.trait].secondary += option.secondaryEffect.value;
        }
    }
    const result = {};
    for (const trait of Object.keys(scores)) {
        const base = Math.round((scores[trait].primary / 18) * 10);
        const randomness = Math.floor(Math.random() * 3) - 1;
        const final = Math.max(0, Math.min(10, base + scores[trait].secondary + randomness));
        result[trait] = final;
    }
    return result;
}
//# sourceMappingURL=questionnaire.js.map