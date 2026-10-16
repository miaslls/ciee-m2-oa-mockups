export const questionCases = [
  {
    person: 'Não estou conseguindo acessar.',
    question: 'O que acontece quando você tenta acessar?',
    expected: 'abrir',
    context: 'A situação ainda está geral: sabemos apenas que há uma dificuldade de acesso.',
    function: 'A pergunta abre espaço para informações que ainda não apareceram.',
    effect: 'O mapa ganha um ramo sobre o que acontece na tentativa de acesso.',
    known: 'Dificuldade de acesso',
    branch: 'O que acontece ao tentar acessar',
  },
  {
    person: 'Quando tento acessar, aparece uma mensagem dizendo que meus dados não foram localizados.',
    question: 'Em que momento essa mensagem aparece?',
    expected: 'aprofundar',
    context: 'A mensagem sobre dados não localizados já está presente na conversa.',
    function: 'A pergunta permanece nesse ponto e busca compreendê-lo melhor.',
    effect: 'O ramo da mensagem é ampliado com a informação sobre quando ela aparece.',
    known: 'Mensagem: dados não localizados',
    branch: 'Momento em que a mensagem aparece',
  },
  {
    person: 'Aparece uma mensagem de erro quando tento acessar.',
    question: 'O que aconteceu antes dessa mensagem aparecer?',
    expected: 'abrir',
    context: 'Sabemos que há uma mensagem de erro, mas nada foi dito sobre eventos anteriores.',
    function: 'A pergunta amplia o campo de informações para outro momento da situação.',
    effect: 'O mapa ganha um ramo sobre o que aconteceu antes da mensagem.',
    known: 'Mensagem de erro ao acessar',
    branch: 'O que aconteceu antes da mensagem',
  },
  {
    person: 'Enviei os documentos e depois apareceu uma pendência de escolaridade.',
    question: 'Qual informação aparece junto dessa pendência de escolaridade?',
    expected: 'aprofundar',
    context: 'A pendência de escolaridade já foi introduzida pela pessoa.',
    function: 'A pergunta se concentra nessa pendência e busca mais detalhe.',
    effect: 'O ramo da pendência de escolaridade é expandido.',
    known: 'Documentos enviados · pendência de escolaridade',
    branch: 'Informação junto da pendência',
  },
  {
    person: 'Recebi uma mensagem dizendo que minha inscrição está incompleta.',
    question: 'Que informação aparece para você neste momento?',
    expected: 'abrir',
    context: 'A inscrição incompleta foi mencionada, mas ainda não há um ramo específico para aprofundar.',
    function: 'A pergunta amplia as informações disponíveis neste momento.',
    effect: 'O mapa ganha um ramo sobre o que aparece para a pessoa agora.',
    known: 'Mensagem: inscrição incompleta',
    branch: 'Informação que aparece agora',
  },
]

export const partB = {
  initial: 'Enviei os documentos ontem, mas ainda aparece uma pendência.',
  revealed: 'Continua aparecendo que falta o comprovante de escolaridade.',
  decisions: [
    {
      goal: 'qual pendência continua aparecendo',
      goals: [
        { text: 'qual pendência continua aparecendo', functional: true },
        { text: 'se o envio foi feito ontem', functional: false },
        { text: 'por que a pessoa enviou os documentos', functional: false },
      ],
      intention: 'Abrir a informação sobre a pendência que ainda aparece.',
      questions: [
        { text: 'Qual pendência continua aparecendo para você?', quality: 'best' },
        { text: 'Você pode me dizer qual pendência aparece agora?', quality: 'plausible' },
        { text: 'Você recebeu uma confirmação do envio dos documentos?', quality: 'insufficient' },
      ],
    },
    {
      goal: 'o que o sistema informa especificamente sobre o comprovante de escolaridade',
      goals: [
        { text: 'o que o sistema informa especificamente sobre o comprovante de escolaridade', functional: true },
        { text: 'toda a história da inscrição desde o início', functional: false },
        { text: 'se os documentos foram enviados ontem', functional: false },
      ],
      intention: 'Aprofundar o ponto já apresentado: o comprovante de escolaridade.',
      questions: [
        { text: 'O que o sistema informa especificamente sobre o comprovante de escolaridade?', quality: 'best' },
        { text: 'A pendência mostra algum detalhe sobre o comprovante de escolaridade?', quality: 'plausible' },
        { text: 'Pode contar novamente tudo o que aconteceu com sua inscrição?', quality: 'insufficient' },
      ],
    },
  ],
}
