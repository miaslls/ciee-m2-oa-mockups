import { AppShell } from '../components/AppShell.js'
import '../styles/oa06.css'

const contexts = [
  { id: 'urgency', label: 'Urgência ou prazo', when: 'houver urgência ou prazo' },
  { id: 'frustration', label: 'Frustração ou reclamação', when: 'a situação envolver frustração ou reclamação' },
  { id: 'dependency', label: 'Dependência de outra área ou etapa', when: 'a continuidade depender de outra área ou etapa' },
  { id: 'expectation', label: 'Expectativa de um resultado que não posso garantir', when: 'houver expectativa de um resultado que não posso garantir' },
  { id: 'general', label: 'De forma geral, nos meus próximos atendimentos', when: 'iniciar meu próximo atendimento' },
  { id: 'private', label: 'Prefiro uma prática geral', when: 'iniciar meu próximo atendimento' },
]

const tools = [
  { id: 'recap', title: 'Recapitular e validar', description: 'Confirmar se compreendi antes de orientar.', action: 'devolver o que compreendi e confirmar se corresponde ao que a pessoa quis comunicar antes de orientar.' },
  { id: 'ask', title: 'Perguntar com propósito', description: 'Identificar o que ainda preciso compreender e fazer uma pergunta que ajude a obter essa informação.', action: 'identificar o que ainda preciso compreender e formular uma pergunta para obter essa informação.' },
  { id: 'separate', title: 'Separar informação de interpretação', description: 'Distinguir o que realmente sei daquilo que estou acrescentando à situação.', action: 'separar o que foi realmente informado daquilo que estou interpretando antes de orientar.' },
  { id: 'care', title: 'Acolher com responsabilidade', description: 'Reconhecer a experiência e conduzir sem assumir ou prometer aquilo que não depende exclusivamente de mim.', action: 'reconhecer a experiência apresentada e explicar o próximo passo possível sem prometer um resultado que não posso garantir.' },
]

const reviewStates = [
  ['context', '1 · Seleção de contexto'], ['kit', '2 · Kit de quatro ferramentas'],
  ['selected', '3 · Uma ferramenta selecionada'], ['generated', '4 · Compromisso gerado'],
  ['card', '5 · Cartão final'], ['confirmed', '6 · Compromisso confirmado'],
  ['review', '7 · Rever compromisso existente'], ['synthesis', '8 · Síntese das quatro ferramentas'],
]

const el = (tag, className = '', text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])
const button = (action, label, secondary = false, disabled = false) =>
  `<button type="button" class="oa06-${secondary ? 'secondary' : 'primary'}" data-action="${action}"${disabled ? ' disabled' : ''}>${label}</button>`
const actions = (...items) => `<div class="oa06-actions">${items.join('')}</div>`

export function OA06Page() {
  const state = { screen: 'context', context: null, tool: null }
  const header = el('div', 'oa06-header')
  const heading = el('div')
  const h1 = el('h1', '', 'Minha mudança no próximo atendimento')
  h1.tabIndex = -1
  heading.append(el('p', 'oa06-kicker', 'OA 06  /  TRANSFERÊNCIA PARA A PRÁTICA'), h1,
    el('p', 'oa06-subtitle', 'Escolha uma pequena mudança que você possa praticar e observar.'))
  const stepper = el('div', 'oa06-stepper')
  ;['Contexto', 'Ferramenta', 'Compromisso'].forEach((label, index) => {
    if (index) stepper.append(el('span', 'oa06-stepper__arrow', '→'))
    const step = el('span', '', `${index + 1}  ·  ${label}`)
    step.dataset.step = String(index + 1)
    stepper.append(step)
  })
  header.append(heading, stepper)

  const workspace = el('div', 'oa06-workspace')
  const stage = el('div', 'oa06-stage')
  const review = el('div', 'oa06-review')
  const reviewLabel = el('label', '', 'Prévia de estados')
  const reviewSelect = el('select', 'oa06-review__select')
  reviewSelect.id = 'oa06-review-state'
  reviewLabel.htmlFor = reviewSelect.id
  reviewStates.forEach(([value, label]) => {
    const option = el('option', '', label)
    option.value = value
    reviewSelect.append(option)
  })
  review.append(el('span', 'oa06-review__marker', 'REVISÃO DO MOCKUP'), reviewLabel, reviewSelect)
  workspace.append(stage, review)

  const selectedContext = () => contexts.find((item) => item.id === state.context)
  const selectedTool = () => tools.find((item) => item.id === state.tool)
  const commitment = () => `Quando ${selectedContext().when}, vou ${selectedTool().action}`
  const frame = (part, title, detail, body) => `<div class="oa06-frame"><div class="oa06-frame__header"><p class="oa06-kicker">${part}</p><h2 tabindex="-1">${title}</h2><p class="oa06-muted">${detail}</p></div><div class="oa06-body">${body}</div></div>`

  const contextPanel = () => `<fieldset class="oa06-context"><legend>Em que tipo de atendimento você quer praticar?</legend>
    <p>Pense em um tipo de atendimento que costuma exigir mais atenção no seu dia a dia. Não é preciso contar uma dificuldade pessoal.</p>
    <div class="oa06-context__grid">${contexts.map((item) => `<label class="oa06-context__option${state.context === item.id ? ' is-selected' : ''}"><input type="radio" name="context" value="${item.id}"${state.context === item.id ? ' checked' : ''}><span>${escapeHtml(item.label)}</span></label>`).join('')}</div>
  </fieldset>`

  const kit = (selected = false) => `<fieldset class="oa06-kit"><legend>Quatro ferramentas para levar ao próximo atendimento</legend>
    <p>Escolha uma ferramenta para colocar em prática. Todas podem ajudar em contextos diferentes.</p>
    <div class="oa06-kit__grid">${tools.map((item, index) => `<label class="oa06-tool${selected && state.tool === item.id ? ' is-selected' : ''}${selected && state.tool !== item.id ? ' is-receded' : ''}"><input type="radio" name="tool" value="${item.id}"${state.tool === item.id ? ' checked' : ''}><span class="oa06-tool__number">${String(index + 1).padStart(2, '0')}</span><span class="oa06-tool__copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description)}</span></span></label>`).join('')}</div>
  </fieldset>`

  const bridge = () => `<div class="oa06-bridge"><div><span>CONTEXTO</span><strong>${escapeHtml(selectedContext().label)}</strong></div><span class="oa06-bridge__plus" aria-hidden="true">＋</span><div><span>FERRAMENTA</span><strong>${escapeHtml(selectedTool().title)}</strong></div></div>`
  const finalCard = () => `<article class="oa06-final-card" aria-label="Minha mudança"><div class="oa06-final-card__top"><span class="oa06-final-card__accent" aria-hidden="true"></span><h3>MINHA MUDANÇA</h3></div>
    <dl><div><dt>CONTEXTO</dt><dd>${escapeHtml(selectedContext().label)}</dd></div><div><dt>AÇÃO QUE QUERO PRATICAR</dt><dd>${escapeHtml(selectedTool().title)}</dd></div></dl>
    <div class="oa06-final-card__statement"><p>NO PRÓXIMO ATENDIMENTO</p><blockquote>${escapeHtml(commitment())}</blockquote></div></article>`

  function renderScreen() {
    switch (state.screen) {
      case 'context':
        return frame('ETAPA 1  /  CONTEXTO', 'Escolha um contexto', 'Um ponto de partida para praticar, sem necessidade de exposição pessoal.',
          `<div class="oa06-carry"><p class="oa06-label">SE VIER DO OA 05</p><p>Você pode retomar uma situação de urgência ou prazo que pediu mais atenção. Se preferir, escolha uma prática geral.</p></div>${contextPanel()}${actions(button('kit', 'Ver kit de ferramentas  →', false, !state.context))}`)
      case 'kit':
        return frame('ETAPA 2  /  KIT DE FERRAMENTAS', 'Escolha uma ferramenta', 'Uma ação possível para usar no contexto escolhido.',
          `<p class="oa06-current-context"><span>SEU CONTEXTO</span>${escapeHtml(selectedContext().label)}</p>${kit()}${actions(button('context', 'Alterar contexto', true))}`)
      case 'selected':
        return frame('ETAPA 2  /  FOCO', 'Uma ferramenta em foco', 'As outras continuam disponíveis se você quiser mudar sua escolha.',
          `${bridge()}${kit(true)}${actions(button('generated', 'Construir meu compromisso  →'))}`)
      case 'generated':
        return frame('ETAPA 3  /  COMPROMISSO', 'Uma mudança concreta', 'A frase combina seu contexto com a ferramenta escolhida.',
          `${bridge()}<section class="oa06-generated"><p class="oa06-label">QUANDO [CONTEXTO], VOU [AÇÃO OBSERVÁVEL]</p><p>${escapeHtml(commitment())}</p></section>${actions(button('kit', 'Rever ferramenta', true), button('card', 'Ver meu cartão  →'))}`)
      case 'card':
        return frame('ETAPA 3  /  CARTÃO FINAL', 'Seu compromisso para o próximo atendimento', 'Leia a mudança que você escolheu antes de confirmar.',
          `${finalCard()}${actions(button('generated', 'Voltar à frase', true), button('confirmed', 'CONFIRMAR MEU COMPROMISSO'))}`)
      case 'confirmed':
        return frame('COMPROMISSO CONFIRMADO', 'Compromisso registrado.', 'Sua escolha está registrada nesta atividade.',
          `<div class="oa06-confirmation" role="status">Compromisso registrado.</div>${finalCard()}${actions(button('review', 'REVER MEU COMPROMISSO', true), button('synthesis', 'Ver síntese  →'))}`)
      case 'review':
        return frame('REVISÃO DO COMPROMISSO', 'Reveja sua escolha', 'Você pode manter ou trocar a ferramenta e o contexto quando quiser.',
          `${finalCard()}${actions(button('context', 'Escolher outro contexto', true), button('kit', 'Escolher outra ferramenta', true), button('confirmed', 'Manter meu compromisso'))}`)
      case 'synthesis':
        return frame('SÍNTESE  /  MÓDULO 2', 'Compreender antes de responder', 'As quatro ferramentas se encontram em uma mesma intenção de cuidado.',
          `<div class="oa06-synthesis"><div class="oa06-synthesis__tools">${tools.map((item) => `<span>${escapeHtml(item.title)}</span>`).join('')}</div><div class="oa06-synthesis__center">COMPREENDER ANTES DE RESPONDER</div></div>${actions(button('review', 'REVER MEU COMPROMISSO', true))}`)
      default:
        return ''
    }
  }

  function render(focusHeading = false) {
    stage.innerHTML = renderScreen()
    reviewSelect.value = state.screen
    const step = state.screen === 'context' ? 1 : ['kit', 'selected'].includes(state.screen) ? 2 : 3
    stepper.querySelectorAll('[data-step]').forEach((item) => item.classList.toggle('is-current', Number(item.dataset.step) === step))
    if (focusHeading) stage.querySelector('h2')?.focus({ preventScroll: true })
  }

  stage.addEventListener('change', (event) => {
    const target = event.target
    if (target.name === 'context') state.context = target.value
    if (target.name === 'tool') {
      state.tool = target.value
      state.screen = 'selected'
    }
    render()
    stage.querySelector(`input[name="${target.name}"][value="${target.value}"]`)?.focus({ preventScroll: true })
  })
  stage.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]')
    if (!target || target.disabled) return
    state.screen = target.dataset.action
    render(true)
  })
  reviewSelect.addEventListener('change', () => {
    state.screen = reviewSelect.value
    if (state.screen !== 'context') state.context ||= 'urgency'
    if (!['context', 'kit'].includes(state.screen)) state.tool ||= 'separate'
    render(true)
  })

  render()
  return AppShell({ pageHeader: header, workspace, home: true, contextTitle: 'OA 06' })
}
