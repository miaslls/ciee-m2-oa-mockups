import { AppShell } from '../components/AppShell.js'
import '../styles/oa04.css'

const messages = [
  { text: 'Ok.', options: ['parece irritação', 'parece impaciência', 'parece tranquilidade', 'parece apenas confirmação', 'não acho que dê para afirmar ainda'] },
  { text: 'Preciso disso hoje.', options: ['parece urgência objetiva', 'parece impaciência', 'parece irritação', 'parece preocupação', 'não acho que dê para afirmar um estado emocional ainda'] },
  { text: 'Não entendi.', options: ['parece confusão', 'parece frustração', 'parece irritação', 'parece um pedido neutro de esclarecimento', 'não acho que dê para afirmar o estado emocional'] },
]
const confidenceLevels = ['POUCO', 'MAIS OU MENOS', 'BASTANTE']
const evidenceItems = [
  'Existe uma necessidade relacionada a hoje.',
  'Há um elemento de prazo/tempo relevante.',
  'A pessoa está impaciente.',
  'A pessoa está irritada.',
]
const contextItems = [
  'Há um prazo objetivo até hoje às 17h.',
  '“Hoje” se relaciona ao prazo das 17h.',
  'A pessoa está impaciente.',
  'A pessoa está irritada.',
]
const reviewStates = [
  ['a-message', '1 · Parte A: mensagem'],
  ['a-selected', '2 · Interpretação selecionada'],
  ['a-confidence', '3 · Confiança selecionada'],
  ['b-restore', '4 · Leitura retomada'],
  ['b-evidence', '5 · Seleção de evidências'],
  ['b-detach', '6 · Interpretação destacada'],
  ['b-context-hidden', '7 · Contexto oculto'],
  ['b-context-revealed', '8 · Contexto revelado'],
  ['b-classify', '9 · Classificação após contexto'],
  ['b-synthesis', '10 · Síntese'],
]

const el = (tag, cls = '', text) => {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text !== undefined) node.textContent = text
  return node
}
const action = (name, text, secondary = false, disabled = false) =>
  `<button type="button" class="oa04-${secondary ? 'secondary' : 'primary'}" data-action="${name}"${disabled ? ' disabled' : ''}>${text}</button>`
const message = (text, previous = false) => `<section class="oa04-message${previous ? ' oa04-message--previous' : ''}">
  <p class="oa04-label">${previous ? 'CONTEXTO · MENSAGEM ANTERIOR' : 'MENSAGEM · CONTEÚDO ENVIADO'}</p>
  <p class="oa04-message__text">“${text}”</p>
</section>`

export function OA04Page() {
  const state = {
    part: 'a', item: 0, aStep: 'reading', reading: null, confidence: null,
    records: [null, null, null], phase: 'restore', evidence: new Set(),
    context: false, classifications: {},
  }
  const header = el('div', 'oa04-header')
  const title = el('div')
  const h1 = el('h1', '', 'Da interpretação à confirmação')
  h1.tabIndex = -1
  title.append(el('p', 'oa04-kicker', 'OA 04  /  LEITURA DE MENSAGENS'), h1,
    el('p', 'oa04-subtitle', 'O que foi dito, o que lemos e o que ainda precisamos confirmar.'))
  const stepper = el('div', 'oa04-stepper')
  const stepA = el('span', '', 'A  ·  Qual foi sua primeira leitura?')
  const stepB = el('span', '', 'B  ·  Volte à sua leitura')
  stepper.append(stepA, el('span', 'oa04-stepper__arrow', '→'), stepB)
  header.append(title, stepper)
  const workspace = el('div', 'oa04-workspace')
  const stage = el('div', 'oa04-stage')
  const review = el('div', 'oa04-review')
  const reviewLabel = el('label', '', 'Prévia de estados')
  const reviewSelect = el('select', 'oa04-review__select')
  reviewSelect.id = 'oa04-review-state'
  reviewLabel.htmlFor = reviewSelect.id
  reviewStates.forEach(([value, label]) => {
    const option = el('option', '', label)
    option.value = value
    reviewSelect.append(option)
  })
  review.append(el('span', 'oa04-review__marker', 'REVISÃO DO MOCKUP'), reviewLabel, reviewSelect)
  workspace.append(stage, review)

  const record = () => state.records[1]
  const hypothesis = () => record() ? messages[1].options[record().reading] : ''
  const frame = (kicker, heading, detail, body) => `<div class="oa04-frame">
    <div class="oa04-frame__header"><p class="oa04-kicker">${kicker}</p>
      <h2 tabindex="-1">${heading}</h2><p class="oa04-muted">${detail}</p></div>${body}</div>`
  const controls = (options, selected, name) => `<div class="oa04-choice-list" role="radiogroup" aria-label="${name}">
    ${options.map((text, index) => `<label class="oa04-choice${selected === index ? ' is-selected' : ''}">
      <input type="radio" name="${name}" value="${index}"${selected === index ? ' checked' : ''}><span>${text}</span></label>`).join('')}</div>`
  const confidence = () => `<fieldset class="oa04-confidence"><legend>Quanto você confiaria nessa primeira leitura?</legend>
    <div class="oa04-confidence__options">${confidenceLevels.map((level) => `<label class="oa04-confidence__option${state.confidence === level ? ' is-selected' : ''}">
      <input type="radio" name="confidence" value="${level}"${state.confidence === level ? ' checked' : ''}><span>${level}</span></label>`).join('')}</div></fieldset>`
  const actions = (...items) => `<div class="oa04-actions">${items.join('')}</div>`
  const layout = (main, side) => `<div class="oa04-layout"><div class="oa04-main">${main}</div>${side}</div>`
  const layers = () => `<aside class="oa04-layers"><p class="oa04-label">QUATRO CAMADAS</p>
    ${[
      ['01', 'MENSAGEM', 'Conteúdo que foi enviado.'],
      ['02', 'INTERPRETAÇÃO', 'Leitura possível; uma hipótese.'],
      ['03', 'CONTEXTO', state.context ? 'Informação anterior verificável.' : 'Ainda não revelado.'],
      ['04', 'A CONFIRMAR', 'O que não se conclui dessas mensagens.'],
    ].map(([number, label, detail]) => `<div class="oa04-layers__row"><span>${number}</span><strong>${label}</strong><p>${detail}</p></div>`).join('')}</aside>`
  const board = (detached = false, animate = false) => `<div class="oa04-board${detached ? ' is-detached' : ''}${animate ? ' is-animating' : ''}">
    <div class="oa04-board__message"><p class="oa04-label">MENSAGEM</p><p class="oa04-board__quote">“Preciso disso hoje.”</p></div>
    <div class="oa04-board__interpretation"><p class="oa04-label">INTERPRETAÇÃO / HIPÓTESE</p>
      <p>${detached ? 'Uma leitura possível permanece aqui.' : 'Esta camada ficará separada da mensagem.'}</p></div>
    <span class="oa04-board__tag">${hypothesis()}</span></div>
    <p class="oa04-board__caption">${detached
      ? 'A interpretação está fora da mensagem. Ela continua possível, mas não é informação confirmada. A mensagem permanece igual.'
      : 'A etiqueta da primeira leitura ainda está próxima da mensagem. A seguir, vamos separá-las.'}</p>`
  const facts = (afterContext = false) => `<div class="oa04-facts"><section><h3>${afterContext ? 'AGORA POSSO AFIRMAR' : 'POSSO AFIRMAR'}</h3><ul>
    ${afterContext ? '<li>Há um prazo objetivo até hoje às 17h.</li><li>“Hoje” se relaciona ao prazo das 17h.</li>'
      : '<li>Existe uma necessidade relacionada a hoje.</li><li>Há um elemento de prazo/tempo relevante.</li>'}</ul></section>
    <section><h3>AINDA NÃO CONFIRMADO</h3><ul><li>Impaciência.</li><li>Irritação.</li></ul></section></div>`
  function updateStepper() {
    stepA.classList.toggle('is-current', state.part === 'a')
    stepB.classList.toggle('is-current', state.part === 'b')
    stepA.setAttribute('aria-current', state.part === 'a' ? 'step' : 'false')
    stepB.setAttribute('aria-current', state.part === 'b' ? 'step' : 'false')
  }
  function renderA() {
    state.part = 'a'
    updateStepper()
    reviewSelect.value = state.confidence ? 'a-confidence' : state.reading !== null ? 'a-selected' : 'a-message'
    const item = messages[state.item]
    let main = message(item.text)
    if (state.aStep === 'recorded') {
      main += `<section class="oa04-notice" aria-live="polite"><h3 tabindex="-1">Leitura registrada. Guarde essa impressão.</h3>
        <p>Sua leitura: “${item.options[state.reading]}” · Confiança: ${state.confidence}</p></section>`
      main += actions(action('next-message', state.item === 2 ? 'Volte à sua leitura  →' : 'Próxima mensagem  →'))
    } else {
      main += `<h3 class="oa04-question">Qual leitura surgiu primeiro para você?</h3>`
      main += controls(item.options, state.reading, 'reading')
      if (state.reading !== null) main += confidence() + actions(action('record', 'Registrar leitura  →', false, !state.confidence))
    }
    const side = `<aside class="oa04-aside"><p class="oa04-label">PRIMEIRA IMPRESSÃO</p>
      <h3>Registre sem procurar uma resposta certa.</h3>
      <p>Sua escolha e sua confiança ficam guardadas para a segunda parte. Nenhuma leitura recebe correção agora.</p>
      <div class="oa04-progress">${messages.map((_, index) => `<div class="oa04-progress__item${state.records[index] ? ' is-complete' : ''}${index === state.item ? ' is-current' : ''}">
        <span>0${index + 1}</span><span>${state.records[index] ? 'Leitura registrada' : index === state.item ? 'Mensagem atual' : 'A seguir'}</span></div>`).join('')}</div></aside>`
    stage.innerHTML = frame(`PARTE A  /  MENSAGEM ${String(state.item + 1).padStart(2, '0')} DE 03`,
      'Qual foi sua primeira leitura?', 'Leia a mensagem como ela aparece. Registre a leitura que surgiu primeiro para você.', layout(main, side))
  }
  function renderMissing() {
    let main = message(messages[1].text) + '<h3 class="oa04-question">Qual leitura surgiu primeiro para você?</h3>'
    main += controls(messages[1].options, state.reading, 'reading')
    if (state.reading !== null) main += confidence() + actions(action('save-reading', 'Continuar  →', false, !state.confidence))
    stage.innerHTML = frame('PARTE B  /  VOLTE À SUA LEITURA', 'Retome sua primeira leitura',
      'Para continuar, registre rapidamente como você leu “Preciso disso hoje.”', `<div class="oa04-main">${main}</div>`)
  }
  function renderB() {
    state.part = 'b'
    updateStepper()
    if (!record()) { renderMissing(); return }
    reviewSelect.value = `b-${state.phase}`
    const headings = {
      restore: ['Volte à sua leitura', 'Agora vamos separar o que a mensagem realmente sustenta daquilo que acrescentamos ao ler.'],
      evidence: ['O que posso afirmar?', 'Escolha as afirmações que a mensagem, sozinha, realmente sustenta.'],
      detach: ['O que estou acrescentando?', 'Observe sua interpretação sair da mensagem e ocupar uma camada própria.'],
      'context-hidden': ['Antes de ver o contexto', 'A mensagem e a interpretação estão separadas. Revele a informação anterior.'],
      'context-revealed': ['Ver contexto', 'A mensagem anterior acrescenta um dado verificável, sem confirmar um estado emocional.'],
      classify: ['O que mudou?', 'Classifique o que agora pode ser afirmado e o que ainda exige confirmação.'],
      synthesis: ['Da interpretação à confirmação', 'Quatro perguntas para levar a outras mensagens.'],
    }
    let main = ''
    if (state.phase === 'restore') {
      main = `<section class="oa04-reading"><p class="oa04-label">SUA PRIMEIRA LEITURA</p>
        <p class="oa04-reading__quote">“${hypothesis()}”</p><p>Você disse que confiaria: <strong>${record().confidence}</strong></p></section>
        ${message(messages[1].text)}<p class="oa04-bridge">Agora vamos separar o que a mensagem realmente sustenta daquilo que acrescentamos ao ler.</p>
        ${actions(action('evidence', 'O que posso afirmar?  →'))}`
    }
    if (state.phase === 'evidence') {
      main = board() + `<fieldset class="oa04-evidence"><legend>Quais afirmações são sustentadas pela mensagem?</legend>
        ${evidenceItems.map((text, index) => `<label class="oa04-check${state.evidence.has(index) ? ' is-selected' : ''}">
          <input type="checkbox" name="evidence" value="${index}"${state.evidence.has(index) ? ' checked' : ''}><span>${text}</span></label>`).join('')}</fieldset>`
      main += actions(action('detach', 'Separar as camadas  →'))
    }
    if (state.phase === 'detach') {
      main = board(true, true) + facts() + actions(action('context-hidden', 'Continuar  →'))
    }
    if (state.phase.startsWith('context-')) {
      const revealed = state.phase === 'context-revealed'
      main = board(true) + `<section class="oa04-context" id="oa04-context-content"><p class="oa04-label">CONTEXTO</p>
        ${revealed ? message('Tenho prazo para enviar a documentação até hoje às 17h.', true)
          : '<p class="oa04-context__hidden">A mensagem anterior está oculta.</p>'}</section>`
      main += actions(`<button type="button" class="oa04-secondary" id="oa04-context-toggle" data-action="toggle-context"
        aria-controls="oa04-context-content" aria-expanded="${revealed}">${revealed ? 'OCULTAR CONTEXTO' : 'VER CONTEXTO'}</button>`)
      if (revealed) main += `<p class="oa04-bridge">O contexto mostra um prazo objetivo: “hoje” se relaciona ao envio até as 17h.
        Ele ainda não confirma irritação nem impaciência.</p>${actions(action('classify', 'O que mudou?  →'))}`
    }
    if (state.phase === 'classify') {
      main = message('Tenho prazo para enviar a documentação até hoje às 17h.', true) + message(messages[1].text)
      main += `<fieldset class="oa04-classify"><legend>Onde cada afirmação fica agora?</legend>
        ${contextItems.map((text, index) => `<div class="oa04-classify__row"><label for="oa04-classify-${index}">${text}</label>
          <select id="oa04-classify-${index}" name="classification" data-index="${index}">
            <option value="">Selecione uma camada</option>
            <option value="affirm"${state.classifications[index] === 'affirm' ? ' selected' : ''}>AGORA POSSO AFIRMAR</option>
            <option value="confirm"${state.classifications[index] === 'confirm' ? ' selected' : ''}>AINDA É INTERPRETAÇÃO / PRECISA SER CONFIRMADO</option>
          </select></div>`).join('')}</fieldset>`
      main += actions(action('synthesis', 'Ver síntese  →', false, Object.values(state.classifications).filter(Boolean).length !== 4))
    }
    if (state.phase === 'synthesis') {
      main = `<section class="oa04-synthesis"><p class="oa04-label">SÍNTESE</p>
        <h3>Contexto pode ampliar o que sabemos sem transformar interpretação em certeza.</h3>
        ${facts(true)}
        <div class="oa04-synthesis__prompts">${[
          ['MENSAGEM', 'O que está aqui?'], ['INTERPRETAÇÃO', 'O que eu acrescentei?'],
          ['CONTEXTO', 'O que o contexto permite compreender?'], ['A CONFIRMAR', 'O que ainda precisaria ser confirmado?'],
        ].map(([label, question]) => `<div><span>${label}</span><strong>${question}</strong></div>`).join('')}</div></section>
        ${actions('<a class="oa04-secondary" href="#/">Voltar ao índice  →</a>')}`
    }
    stage.innerHTML = frame('PARTE B  /  VOLTE À SUA LEITURA', headings[state.phase][0], headings[state.phase][1], layout(main, layers()))
  }
  const render = (focus = false) => {
    if (state.part === 'a') renderA()
    else renderB()
    if (focus) stage.querySelector('h2')?.focus({ preventScroll: true })
  }
  stage.addEventListener('change', (event) => {
    const target = event.target
    if (target.name === 'reading') {
      state.reading = Number(target.value)
      render()
      stage.querySelector('input[name="confidence"]')?.focus({ preventScroll: true })
    }
    if (target.name === 'confidence') {
      state.confidence = target.value
      render()
      stage.querySelector('[data-action="record"], [data-action="save-reading"]')?.focus({ preventScroll: true })
    }
    if (target.name === 'evidence') {
      const index = Number(target.value)
      if (target.checked) state.evidence.add(index)
      else state.evidence.delete(index)
      target.closest('label').classList.toggle('is-selected', target.checked)
    }
    if (target.name === 'classification') {
      state.classifications[target.dataset.index] = target.value
      stage.querySelector('[data-action="synthesis"]').disabled = Object.values(state.classifications).filter(Boolean).length !== 4
    }
  })
  stage.addEventListener('click', (event) => {
    const name = event.target.closest('[data-action]')?.dataset.action
    if (!name) return
    if (name === 'record') {
      state.records[state.item] = { reading: state.reading, confidence: state.confidence }
      state.aStep = 'recorded'
    } else if (name === 'next-message') {
      if (state.item === 2) { state.part = 'b'; state.phase = 'restore' }
      else { state.item += 1; state.reading = null; state.confidence = null; state.aStep = 'reading' }
    } else if (name === 'save-reading') {
      state.records[1] = { reading: state.reading, confidence: state.confidence }
      state.phase = 'restore'
    } else if (name === 'toggle-context') {
      state.context = !state.context
      state.phase = state.context ? 'context-revealed' : 'context-hidden'
      render()
      stage.querySelector('#oa04-context-toggle')?.focus({ preventScroll: true })
      return
    } else { state.phase = name; state.part = 'b' }
    render(name !== 'record')
    if (name === 'record') stage.querySelector('.oa04-notice h3')?.focus({ preventScroll: true })
  })
  reviewSelect.addEventListener('change', () => {
    const value = reviewSelect.value
    Object.assign(state, { item: 0, aStep: 'reading', reading: null, confidence: null,
      records: [null, null, null], evidence: new Set(), context: false, classifications: {} })
    if (value.startsWith('a-')) {
      state.part = 'a'
      if (value !== 'a-message') state.reading = 1
      if (value === 'a-confidence') state.confidence = 'BASTANTE'
    } else {
      state.part = 'b'
      state.phase = value.slice(2)
      state.records[1] = { reading: 1, confidence: 'BASTANTE' }
      if (['context-revealed', 'classify', 'synthesis'].includes(state.phase)) state.context = true
      if (state.phase === 'evidence') state.evidence = new Set([0, 1])
      if (state.phase === 'classify') state.classifications = { 0: 'affirm', 1: 'affirm', 2: 'confirm', 3: 'confirm' }
    }
    render(true)
  })
  render()
  return AppShell({ pageHeader: header, workspace, home: true, contextTitle: 'OA 04' })
}
