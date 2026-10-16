export const recapMessage = 'Eu atualizei meus dados ontem, mas continuo recebendo uma mensagem dizendo que meu cadastro está incompleto.'

export const recapBlocks = [
  { id: 'updated', text: 'você atualizou seus dados ontem', source: '01', kind: 'supported' },
  { id: 'message', text: 'a mensagem de cadastro incompleto continua aparecendo', source: '02', kind: 'supported' },
  { id: 'intent', text: 'você quer compreender o que ainda precisa ser feito', kind: 'intent' },
  { id: 'processing', text: 'o sistema ainda não processou a atualização', kind: 'assumption' },
  { id: 'resend', text: 'será necessário reenviar todos os dados', kind: 'assumption' },
  { id: 'error', text: 'houve um erro no cadastro', kind: 'assumption' },
]

export const gapMessage = 'Não estou conseguindo acessar.'
export const gapZones = [
  { id: 'informed', title: 'JÁ FOI INFORMADO', description: 'Fatos apresentados pela pessoa.', index: '01' },
  { id: 'needed', title: 'AINDA PRECISO COMPREENDER', description: 'Informações necessárias para avançar com segurança.', index: '02' },
  { id: 'later', title: 'NÃO PRECISO CONCLUIR AGORA', description: 'Hipóteses ou detalhes que não precisam ser preenchidos neste momento.', index: '03' },
]
export const gapCards = [
  { id: 'difficulty', text: 'Existe uma dificuldade de acesso', expected: 'informed' },
  { id: 'which', text: 'Qual acesso a pessoa está tentando realizar', expected: 'needed' },
  { id: 'happens', text: 'O que acontece quando ela tenta acessar', expected: 'needed' },
  { id: 'password', text: 'A pessoa esqueceu a senha', expected: 'later' },
  { id: 'system', text: 'Existe um erro no sistema', expected: 'later' },
]
