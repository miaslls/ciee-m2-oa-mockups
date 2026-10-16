import { AppShell } from '../components/AppShell.js'
import { partB, questionCases } from '../data/oa03-items.js'
import '../styles/oa03.css'

const previews = [
  ['a-initial', 'Parte A · início'], ['a-open', 'Parte A · feedback ABRIR'],
  ['a-deepen', 'Parte A · feedback APROFUNDAR'], ['a-map', 'Parte A · mapa atualizado'],
  ['b-goal', 'Parte B · escolher informação'], ['b-label', 'Parte B · preciso compreender'],
  ['b-question', 'Parte B · escolher pergunta'], ['b-reveal', 'Parte B · nova informação'],
  ['b-second', 'Parte B · segunda decisão'], ['b-final', 'Parte B · síntese final'],
]
function el(tag, cls = '', text) {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text !== undefined) node.textContent = text
  return node
}
function button(text, cls, action) {
  const node = el('button', cls, text)
  node.type = 'button'
  node.addEventListener('click', action)
  return node
}
function heading(kicker, title, detail) {
  const group = el('div', 'oa03-heading')
  const h = el('h2', '', title)
  h.tabIndex = -1
  group.append(el('p', 'oa03-kicker', kicker), h, el('p', 'oa03-muted', detail))
  return group
}
function thread(messages) {
  const section = el('section', 'oa03-thread')
  section.setAttribute('aria-label', 'Conversa do atendimento')
  const list = el('ol', 'oa03-thread__list')
  messages.forEach(([speaker, text]) => {
    const item = el('li', 'oa03-message')
    item.append(el('strong', '', speaker), el('p', '', `“${text}”`))
    list.append(item)
  })
  section.append(el('h3', 'oa03-kicker', 'CONVERSA ATÉ AQUI'), list)
  return section
}
function map(title, known, branch, mode, note, branchLabel) {
  const section = el('section', 'oa03-map')
  section.setAttribute('aria-label', 'Mapa de informações')
  const nodes = el('div', 'oa03-map__nodes')
  nodes.append(el('div', 'oa03-map__root', 'Situação'))
  const knownNode = el('div', 'oa03-map__known')
  knownNode.append(el('span', 'oa03-map__tag', 'JÁ SABEMOS'), el('strong', '', known))
  nodes.append(knownNode)
  if (branch) {
    const branchNode = el('div', `oa03-map__branch oa03-map__branch--${mode}`)
    branchNode.append(el('span', 'oa03-map__tag', branchLabel || (mode === 'abrir' ? 'NOVO RAMO' : 'RAMO APROFUNDADO')), el('strong', '', branch))
    nodes.append(branchNode)
  }
  section.append(el('p', 'oa03-kicker', 'MAPA DE INFORMAÇÕES'), el('h3', '', title), nodes, el('p', 'oa03-map__note', note))
  return section
}
function actions(...children) {
  const row = el('div', 'oa03-actions')
  row.append(...children)
  return row
}

export function OA03Page() {
  const state = { part: 'a', item: 0, answer: null, decision: 0, phase: 'goal', goal: null, goalFeedback: false, question: null, firstQuestion: null }
  const header = el('div', 'oa03-header')
  const title = el('div')
  const h1 = el('h1', '', 'Perguntar com propósito')
  h1.tabIndex = -1
  title.append(el('p', 'oa03-kicker', 'OA 03  /  PERGUNTAR COM PROPÓSITO'), h1, el('p', 'oa03-header__subtitle', 'A função da pergunta depende do estado atual da conversa.'))
  const steps = el('div', 'oa03-steps')
  const stepA = el('span', '', 'A  ·  Abrir ou aprofundar?')
  const stepB = el('span', '', 'B  ·  Qual informação eu preciso agora?')
  steps.append(stepA, el('span', 'oa03-steps__arrow', '→'), stepB)
  header.append(title, steps)
  const workspace = el('div', 'oa03-workspace')
  const stage = el('div', 'oa03-stage')
  const review = el('div', 'oa03-review')
  const select = el('select', 'oa03-review__select')
  select.id = 'oa03-review-state'
  previews.forEach(([value, label]) => {
    const option = el('option', '', label)
    option.value = value
    select.append(option)
  })
  const label = el('label', '', 'Prévia de estados')
  label.htmlFor = select.id
  review.append(el('span', 'oa03-review__marker', 'REVISÃO DO MOCKUP'), label, select)
  workspace.append(stage, review)
  const focus = (selector) => stage.querySelector(selector)?.focus({ preventScroll: true })
  function setPart(part) {
    stepA.classList.toggle('is-current', part === 'a')
    stepB.classList.toggle('is-current', part === 'b')
    stepA.setAttribute('aria-current', part === 'a' ? 'step' : 'false')
    stepB.setAttribute('aria-current', part === 'b' ? 'step' : 'false')
  }
  function renderA() {
    state.part = 'a'
    setPart('a')
    const item = questionCases[state.item]
    select.value = state.answer ? item.expected === 'abrir' ? 'a-open' : 'a-deepen' : 'a-initial'
    const page = el('div', 'oa03-frame')
    page.append(heading('PARTE A  /  ABRIR OU APROFUNDAR?', 'O que esta pergunta faz nesta conversa?', 'Leia o que a pessoa já disse antes de escolher a função da pergunta.'))
    const layout = el('div', 'oa03-layout')
    const left = el('div', 'oa03-panel')
    left.append(el('p', 'oa03-case-index', `SITUAÇÃO ${String(state.item + 1).padStart(2, '0')} / 05`), thread([['Pessoa', item.person], ['Atendente', item.question]]))
    const choice = el('section', 'oa03-choice')
    choice.append(el('h3', '', 'Qual é a função desta pergunta?'))
    const options = el('div', 'oa03-choice__options')
    ;[['abrir', 'ABRIR'], ['aprofundar', 'APROFUNDAR']].forEach(([value, text]) => {
      const control = button(text, `oa03-option${state.answer === value ? ' is-selected' : ''}`, () => {
        state.answer = value
        renderA()
        focus('.oa03-feedback h3')
      })
      control.setAttribute('aria-pressed', String(state.answer === value))
      options.append(control)
    })
    choice.append(options)
    left.append(choice)
    if (state.answer) {
      const feedback = el('section', 'oa03-feedback')
      feedback.setAttribute('aria-live', 'polite')
      const headingNode = el('h3', '', `A pergunta funciona para ${item.expected.toUpperCase()}`)
      headingNode.tabIndex = -1
      feedback.append(headingNode)
      if (state.answer !== item.expected) feedback.append(el('p', 'oa03-feedback__correction', 'Sua escolha aponta para outra função. Observe o que já estava na conversa e o que a pergunta passa a buscar.'))
      ;[['CONTEXTO', item.context], ['FUNÇÃO', item.function], ['EFEITO', item.effect]].forEach(([name, text]) => {
        const row = el('div', 'oa03-feedback__row')
        row.append(el('strong', '', name), el('p', '', text))
        feedback.append(row)
      })
      left.append(feedback, actions(button(state.item === questionCases.length - 1 ? 'Ir para a parte B  →' : 'Próxima situação  →', 'oa03-primary', () => {
        if (state.item === questionCases.length - 1) renderB()
        else { state.item += 1; state.answer = null; renderA() }
        focus('.oa03-heading h2')
      })))
    }
    const right = el('div', 'oa03-side')
    right.append(map(state.answer ? 'Depois da pergunta' : 'Antes da pergunta', item.known, state.answer ? item.branch : null, item.expected,
      state.answer ? item.expected === 'abrir' ? 'ABRIR — A pergunta amplia o mapa e cria novos ramos de informação.' : 'APROFUNDAR — A pergunta aproxima e expande um ramo que já existe.' : 'O mapa mostra apenas o que já foi apresentado. Escolha a função para ver como a pergunta o modifica.'))
    right.append(el('p', 'oa03-side__key', 'ABRIR — A pergunta amplia o mapa e cria novos ramos de informação.\nAPROFUNDAR — A pergunta aproxima e expande um ramo que já existe.'))
    layout.append(left, right)
    page.append(layout)
    stage.replaceChildren(page)
  }
  function goalLabel() {
    const node = el('div', 'oa03-goal-label')
    node.append(el('span', '', 'PRECISO COMPREENDER:'), el('strong', '', state.goal))
    return node
  }
  function bMap() {
    if (state.phase === 'synthesis') return map('Após aprofundar', 'Pendência → comprovante de escolaridade', 'Novo detalhe obtido', 'aprofundar', 'Representação da função da pergunta. O conteúdo desse detalhe não é simulado neste mockup.', 'EFEITO DA PERGUNTA')
    if (state.decision === 1 || state.phase === 'reveal') return map('Após a primeira pergunta', 'Pendência → documentos enviados ontem', 'Comprovante de escolaridade ainda pendente', 'abrir', 'JÁ SABEMOS — documentos enviados ontem. NOVO DADO — falta o comprovante. AINDA PRECISAMOS COMPREENDER — o que o sistema informa sobre ele.', 'NOVO DADO')
    return map('Estado inicial', 'Pendência', null, null, 'JÁ SABEMOS — a pessoa enviou os documentos ontem e ainda vê uma pendência. AINDA PRECISAMOS COMPREENDER — qual pendência aparece.')
  }
  function feedbackB(decision, question) {
    const panel = el('section', 'oa03-feedback')
    panel.setAttribute('aria-live', 'polite')
    const title = el('h3', '', question.quality === 'best' ? 'Pergunta mais funcional para este objetivo' : question.quality === 'plausible' ? 'Outra formulação possível' : 'Volte à informação necessária')
    title.tabIndex = -1
    panel.append(title)
    panel.append(el('p', '', question.quality === 'best' ? 'A pergunta busca diretamente a informação definida como necessária neste ponto da conversa.' : question.quality === 'plausible' ? 'Esta formulação também pode obter a informação. A opção mais direta explicita melhor o que precisamos compreender agora.' : 'A pergunta pode ser válida em outro momento, mas não ajuda a obter a informação que você definiu como necessária agora.'))
    if (question.quality === 'insufficient') panel.append(el('p', 'oa03-feedback__reminder', 'O que você precisa compreender neste ponto da conversa?'))
    const axis = el('div', 'oa03-feedback__axis')
    axis.append(el('span', '', `CONTEXTO — ${state.decision === 0 ? 'pendência não identificada' : 'comprovante identificado'}`), el('span', '', `FUNÇÃO — ${decision.intention}`), el('span', '', `EFEITO — ${question.quality === 'insufficient' ? 'desvia do objetivo atual' : 'aproxima a informação necessária'}`))
    panel.append(axis)
    return panel
  }
  function renderB() {
    state.part = 'b'
    setPart('b')
    select.value = state.phase === 'synthesis' ? 'b-final' : state.decision === 1 && state.phase === 'goal' ? 'b-second' : state.phase === 'reveal' ? 'b-reveal' : state.phase === 'question' ? 'b-question' : state.phase === 'intent' ? 'b-label' : 'b-goal'
    const decision = partB.decisions[state.decision]
    const titles = { goal: 'O que preciso compreender agora?', intent: 'Da informação à intenção', question: 'Qual pergunta ajuda a obter essa informação?', reveal: 'Uma nova informação muda a decisão', synthesis: 'Perguntar com propósito' }
    const page = el('div', 'oa03-frame')
    page.append(heading('PARTE B  /  QUAL INFORMAÇÃO EU PRECISO AGORA?', titles[state.phase], 'INFORMAÇÃO NECESSÁRIA → INTENÇÃO → PERGUNTA → NOVA INFORMAÇÃO → NOVA DECISÃO'))
    const layout = el('div', 'oa03-layout')
    const left = el('div', 'oa03-panel')
    if (state.phase !== 'synthesis') {
      const messages = [['Pessoa', partB.initial]]
      if (state.decision === 1 || state.phase === 'reveal') messages.push(['Atendente', state.firstQuestion || partB.decisions[0].questions[0].text], ['Pessoa', partB.revealed])
      left.append(thread(messages))
    }
    if (state.phase === 'goal') {
      if (state.decision === 0) left.append(el('p', 'oa03-bridge', 'Você identificou que ainda precisava compreender algo. Aqui, partimos da situação apresentada, sem depender do estado do OA 02.'))
      left.append(el('h3', 'oa03-prompt', 'Qual informação é necessária para decidir o próximo passo?'))
      const options = el('div', 'oa03-stack')
      decision.goals.forEach((goal) => options.append(button(goal.text, 'oa03-card-button', () => {
        if (goal.functional) { state.goal = goal.text; state.goalFeedback = false; state.phase = 'intent' }
        else state.goalFeedback = true
        renderB()
        focus(state.goalFeedback ? '.oa03-feedback h3' : '.oa03-heading h2')
      })))
      left.append(options)
      if (state.goalFeedback) {
        const panel = el('section', 'oa03-feedback')
        const title = el('h3', '', 'Procure a lacuna necessária agora')
        title.tabIndex = -1
        panel.append(title, el('p', '', 'Essa informação pode ter outro uso, mas não resolve o que falta compreender neste ponto da conversa.'))
        const axis = el('div', 'oa03-feedback__axis')
        axis.append(
          el('span', '', `CONTEXTO — ${state.decision === 0 ? 'pendência ainda não identificada' : 'comprovante já identificado'}`),
          el('span', '', `FUNÇÃO — ${decision.intention}`),
          el('span', '', 'EFEITO — a lacuna necessária continua sem resposta'),
        )
        panel.append(axis)
        left.append(panel)
      }
    }
    if (state.goal && ['intent', 'question', 'reveal'].includes(state.phase)) left.append(goalLabel())
    if (state.phase === 'intent') {
      const panel = el('section', 'oa03-intent')
      panel.append(el('p', 'oa03-kicker', 'INTENÇÃO'), el('h3', '', decision.intention), el('p', '', 'Com a informação necessária definida, escolha uma pergunta que ajude a obtê-la.'))
      left.append(panel, actions(button('Escolher pergunta  →', 'oa03-primary', () => { state.phase = 'question'; renderB(); focus('.oa03-heading h2') })))
    }
    if (state.phase === 'question') {
      left.append(el('p', 'oa03-intent-inline', `INTENÇÃO  /  ${decision.intention}`))
      const options = el('div', 'oa03-stack')
      decision.questions.forEach((question, index) => {
        const control = button(`“${question.text}”`, `oa03-card-button${state.question === index ? ' is-selected' : ''}`, () => { state.question = index; renderB(); focus('.oa03-feedback h3') })
        control.setAttribute('aria-pressed', String(state.question === index))
        options.append(control)
      })
      left.append(options)
      if (state.question !== null) {
        const chosen = decision.questions[state.question]
        left.append(feedbackB(decision, chosen))
        if (chosen.quality !== 'insufficient') left.append(actions(button(state.decision === 0 ? 'Ver nova informação  →' : 'Ver síntese  →', 'oa03-primary', () => {
          if (state.decision === 0) state.firstQuestion = chosen.text
          state.phase = state.decision === 0 ? 'reveal' : 'synthesis'
          renderB()
          focus('.oa03-heading h2')
        })))
      }
    }
    if (state.phase === 'reveal') {
      const panel = el('section', 'oa03-intent')
      panel.append(el('p', 'oa03-kicker', 'NOVA INFORMAÇÃO'), el('h3', '', 'Agora há um ponto específico na conversa.'), el('p', '', 'O comprovante de escolaridade passou a ser o ramo a compreender. A próxima decisão parte deste novo estado.'))
      left.append(panel, actions(button('O que preciso compreender agora?  →', 'oa03-primary', () => {
        state.decision = 1; state.phase = 'goal'; state.goal = null; state.question = null; state.goalFeedback = false
        renderB(); focus('.oa03-heading h2')
      })))
    }
    if (state.phase === 'synthesis') {
      const synthesis = el('section', 'oa03-synthesis')
      synthesis.append(el('p', 'oa03-kicker', 'SÍNTESE'), el('h3', '', 'A pergunta certa depende do que já sabemos e do que ainda precisamos compreender.'), el('p', '', 'Antes de perguntar:'))
      const list = el('ul')
      list.append(el('li', '', '“O que eu preciso compreender melhor?”'), el('li', '', '“Minha pergunta ajuda a obter essa informação?”'))
      synthesis.append(list, el('p', 'oa03-muted', 'A atividade termina após a segunda decisão. A resposta seguinte não é simulada.'))
      const back = el('a', 'oa03-secondary', 'Voltar ao índice  →')
      back.href = '#/'
      left.append(synthesis, actions(back))
    }
    const right = el('div', 'oa03-side')
    right.append(bMap())
    layout.append(left, right)
    page.append(layout)
    stage.replaceChildren(page)
  }
  function preview(value) {
    Object.assign(state, { item: 0, answer: null, decision: 0, phase: 'goal', goal: null, goalFeedback: false, question: null, firstQuestion: null })
    if (value === 'a-open' || value === 'a-map') state.answer = 'abrir'
    if (value === 'a-deepen') { state.item = 1; state.answer = 'aprofundar' }
    if (value.startsWith('a-')) { renderA(); if (value === 'a-map') select.value = 'a-map'; return }
    if (value === 'b-label') { state.goal = partB.decisions[0].goal; state.phase = 'intent' }
    if (value === 'b-question') { state.goal = partB.decisions[0].goal; state.phase = 'question' }
    if (value === 'b-reveal') { state.goal = partB.decisions[0].goal; state.phase = 'reveal' }
    if (value === 'b-second') state.decision = 1
    if (value === 'b-final') { state.decision = 1; state.phase = 'synthesis' }
    renderB()
  }
  select.addEventListener('change', () => { preview(select.value); focus('.oa03-heading h2') })
  preview('a-initial')
  return AppShell({ pageHeader: header, workspace, home: true, contextTitle: 'OA 03' })
}
