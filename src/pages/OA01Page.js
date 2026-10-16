import { AppShell } from '../components/AppShell.js'
import { ConversationCard } from '../components/ConversationCard.js'
import { oa01Items } from '../data/oa01-items.js'
import '../styles/oa01.css'

const categories = [
  { id: 'recapitular', label: 'Recapitular', description: 'Devolve o que foi apresentado' },
  { id: 'validar', label: 'Validar', description: 'Confirma a compreensão' },
  { id: 'outra', label: 'Outra ação', description: 'Realiza uma função diferente' },
]

const reviewStates = [
  ['journey', 'Percurso interativo'],
  ['initial', 'Classificação inicial'],
  ['feedback', 'Escolha e feedback'],
  ['inference', 'Inferência sutil'],
  ['synthesis', 'Síntese final'],
  ['visual', 'Mudança de compreensão'],
]

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

function actionButton(label, onClick) {
  const button = element('button', 'oa01-primary', label)
  button.type = 'button'
  button.addEventListener('click', onClick)
  return button
}

function pageIntro() {
  const intro = element('div', 'oa01-intro')
  const titleGroup = element('div', 'oa01-intro__title')
  titleGroup.append(
    element('p', 'oa01-eyebrow', 'OA 01  /  PRÁTICA DE ESCUTA'),
    element('h1', '', 'Recapitulação ou validação?'),
    element('p', 'oa01-intro__subtitle', 'Observe a função da fala no contexto do atendimento.'),
  )
  titleGroup.querySelector('h1').tabIndex = -1
  const progress = element('div', 'oa01-progress')
  progress.setAttribute('aria-label', 'Posição na atividade')
  progress.append(element('span', 'oa01-progress__caption', 'PERCURSO'), element('strong', 'oa01-progress__value'))
  intro.append(titleGroup, progress)
  return { intro, progressValue: progress.querySelector('strong') }
}

function renderFeedback(item, selected, attendantCard, host, onNext, isLast) {
  attendantCard.classList.add('conversation-card--analyzed')
  attendantCard.querySelectorAll('[data-cue]').forEach((part) => part.classList.add('conversation-card__cue--visible'))

  const panel = element('section', 'oa01-feedback')
  panel.setAttribute('aria-label', 'Análise da formulação')
  panel.append(
    element('p', 'oa01-feedback__eyebrow', 'ANÁLISE DA FALA'),
    element('h3', 'oa01-feedback__title', item.feedbackTitle),
    element('p', 'oa01-feedback__choice', `Sua escolha: ${categories.find((category) => category.id === selected).label}`),
  )
  if (selected !== item.expected) {
    panel.append(element('p', 'oa01-feedback__contrast', `A escolha aponta para outra função. Aqui, a fala ${item.functionVerb}.`))
  }
  const evidence = element('div', 'oa01-feedback__evidence')
  evidence.append(element('span', 'oa01-feedback__evidence-label', 'NA FORMULAÇÃO'), element('p', '', item.evidence))
  panel.append(element('p', 'oa01-feedback__explanation', item.explanation), evidence)
  panel.append(actionButton(isLast ? 'Ver síntese  →' : 'Próximo item  →', onNext))
  host.replaceChildren(panel)
}

function renderItem(index, stage, progressValue, selected = null) {
  const item = oa01Items[index]
  progressValue.textContent = `${index + 1} de ${oa01Items.length}`
  const instruction = element('div', 'oa01-instruction')
  instruction.append(element('span', 'oa01-instruction__line', 'LEIA A SITUAÇÃO'), element('p', '', 'Leia as duas falas. Depois, identifique o que a formulação do atendente está fazendo.'))

  const panel = element('div', 'oa01-activity')
  const conversation = element('section', 'oa01-conversation')
  conversation.setAttribute('aria-label', 'Situação de atendimento')
  conversation.append(element('p', 'oa01-section-label', `SITUAÇÃO ${String(index + 1).padStart(2, '0')}`))
  conversation.append(ConversationCard({ speaker: 'Pessoa atendida', text: item.person, variant: 'person' }))
  const connector = element('div', 'oa01-conversation__connector')
  connector.setAttribute('aria-hidden', 'true')
  connector.append(element('span', '', '↓'))
  conversation.append(connector)
  const attendantCard = ConversationCard({ speaker: 'Atendente', parts: item.attendant, variant: 'attendant' })
  conversation.append(attendantCard)

  const decision = element('section', 'oa01-decision')
  decision.append(element('p', 'oa01-section-label', 'CLASSIFIQUE A FUNÇÃO'))
  const question = element('h2', 'oa01-decision__question', 'O que esta fala está fazendo?')
  question.tabIndex = -1
  decision.append(question, element('p', 'oa01-decision__hint', 'Escolha uma categoria para ver a análise da fala.'))
  const choices = element('div', 'oa01-choices')
  choices.setAttribute('role', 'group')
  choices.setAttribute('aria-label', 'Categorias de classificação')
  const feedbackHost = element('div', 'oa01-feedback-host')
  feedbackHost.id = 'oa01-feedback'
  feedbackHost.setAttribute('role', 'status')
  feedbackHost.setAttribute('aria-live', 'polite')

  function choose(categoryId) {
    choices.querySelectorAll('button').forEach((button) => {
      const isSelected = button.dataset.category === categoryId
      button.classList.toggle('is-selected', isSelected)
      button.setAttribute('aria-pressed', String(isSelected))
      button.querySelector('.oa01-choice__state').textContent = isSelected ? 'Selecionado' : ''
    })
    renderFeedback(item, categoryId, attendantCard, feedbackHost, () => {
      if (index === oa01Items.length - 1) renderSynthesis(stage, progressValue)
      else renderItem(index + 1, stage, progressValue)
      stage.querySelector('h2')?.focus({ preventScroll: true })
    }, index === oa01Items.length - 1)
  }

  categories.forEach((category, optionIndex) => {
    const button = element('button', 'oa01-choice')
    button.type = 'button'
    button.dataset.category = category.id
    button.setAttribute('aria-pressed', 'false')
    button.setAttribute('aria-controls', 'oa01-feedback')
    button.append(element('span', 'oa01-choice__number', `0${optionIndex + 1}`), element('span', 'oa01-choice__text', category.label), element('span', 'oa01-choice__state'))
    button.append(element('small', 'oa01-choice__description', category.description))
    button.addEventListener('click', () => choose(category.id))
    choices.append(button)
  })
  decision.append(choices, feedbackHost)
  panel.append(conversation, decision)
  stage.replaceChildren(instruction, panel)
  if (selected) choose(selected)
}

function renderSynthesis(stage, progressValue) {
  progressValue.textContent = '5 de 5'
  const synthesis = element('section', 'oa01-finale')
  synthesis.append(element('p', 'oa01-section-label', 'AO FINAL DAS CINCO SITUAÇÕES'))
  const heading = element('h2', '', 'A função da fala orienta a escuta.')
  heading.tabIndex = -1
  synthesis.append(heading, element('p', 'oa01-finale__intro', 'As palavras usadas ajudam, mas é a função da formulação no contexto que define a leitura.'))
  const list = element('div', 'oa01-finale__list')
  ;[
    ['01', 'Recapitular', 'Devolver a compreensão construída a partir das informações apresentadas.'],
    ['02', 'Validar', 'Confirmar se essa compreensão corresponde ao que a pessoa quis comunicar.'],
    ['03', 'Outra ação', 'A formulação está realizando outra função naquele momento.'],
  ].forEach(([number, title, description]) => {
    const row = element('div', 'oa01-finale__row')
    row.append(element('span', 'oa01-finale__number', number), element('h3', '', title), element('p', '', description))
    list.append(row)
  })
  const completion = element('div', 'oa01-finale__completion')
  completion.append(actionButton('Concluir atividade  →', () => {
    completion.replaceChildren(element('strong', 'oa01-finale__done', 'Atividade concluída.'))
    const link = element('a', 'oa01-finale__link', 'Voltar ao índice  →')
    link.href = '#/'
    completion.append(link)
    link.focus()
  }))
  synthesis.append(list, completion)
  stage.replaceChildren(synthesis)
}

function renderAssociatedVisual(stage, progressValue) {
  progressValue.textContent = 'Visual associado'
  const visual = element('section', 'oa01-visual')
  visual.append(element('p', 'oa01-section-label', 'VISUAL ASSOCIADO  /  MUDANÇA DE COMPREENSÃO'))
  const heading = element('h2', '', 'Uma nova informação muda a leitura da situação.')
  heading.tabIndex = -1
  visual.append(heading, element('p', 'oa01-visual__intro', 'O entendimento inicial se reorganiza quando um novo dado entra na conversa.'))
  const flow = element('div', 'oa01-visual__flow')
  ;[
    ['01', 'O que eu sabia', 'Informações disponíveis inicialmente.', 'initial'],
    ['02', 'Nova informação', 'Um novo dado de contexto entra.', 'new'],
    ['03', 'Minha compreensão muda', 'A leitura inicial recua e a compreensão atualizada passa a ser principal.', 'updated'],
  ].forEach(([number, title, description, variant], index) => {
    const step = element('div', `oa01-visual__step oa01-visual__step--${variant}`)
    step.append(element('span', 'oa01-visual__number', `ESTADO ${number}`), element('h3', '', title), element('p', '', description))
    flow.append(step)
    if (index < 2) {
      const arrow = element('span', 'oa01-visual__arrow', '→')
      arrow.setAttribute('aria-hidden', 'true')
      flow.append(arrow)
    }
  })
  visual.append(flow, element('p', 'oa01-visual__footnote', 'A interpretação é atualizada; a informação anterior continua fazendo parte do contexto.'))
  stage.replaceChildren(visual)
}

export function OA01Page() {
  const { intro, progressValue } = pageIntro()
  const workspace = element('div', 'oa01-workspace')
  const stage = element('div', 'oa01-stage')
  const review = element('div', 'oa01-review')
  const reviewLabel = element('label', '', 'Prévia de estados')
  const select = element('select', 'oa01-review__select')
  select.id = 'oa01-review-state'
  reviewLabel.htmlFor = select.id
  reviewStates.forEach(([value, label]) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = label
    select.append(option)
  })
  review.append(element('span', 'oa01-review__marker', 'REVISÃO DO MOCKUP'), reviewLabel, select)
  workspace.append(stage, review)

  function showState(value) {
    if (value === 'feedback') renderItem(1, stage, progressValue, 'validar')
    else if (value === 'inference') renderItem(2, stage, progressValue, 'recapitular')
    else if (value === 'synthesis') renderSynthesis(stage, progressValue)
    else if (value === 'visual') renderAssociatedVisual(stage, progressValue)
    else renderItem(0, stage, progressValue)
  }
  select.addEventListener('change', () => showState(select.value))
  showState('journey')
  return AppShell({ pageHeader: intro, workspace, home: true, contextTitle: 'OA 01' })
}
