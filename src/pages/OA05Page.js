import { AppShell } from '../components/AppShell.js'
import '../styles/oa05.css'

const caseText = 'Eu já tentei resolver isso mais de uma vez e continuo sem uma resposta.'
const blocks = [
  { id: 'recognize', label: 'RECONHECER', tag: 'RECONHECE', text: 'Entendo que passar por essa situação mais de uma vez pode gerar desgaste.', effect: 'Este trecho reconhece que a situação teve impacto para a pessoa sem precisar presumir exatamente como ela se sente.' },
  { id: 'conduct', label: 'CONDUZIR', tag: 'CONDUZ', text: 'Vamos organizar o que já aconteceu para compreender o que pode ser feito agora.', effect: 'Aqui a conversa avança para algo que pode ser cuidado na interação.' },
  { id: 'promise', label: 'PROMESSA EXCESSIVA', tag: 'ULTRAPASSA O LIMITE', text: 'Pode deixar que eu vou resolver isso para você.', effect: 'A intenção pode ser acolhedora, mas este trecho promete um resultado que depende de outros fatores.' },
  { id: 'minimize', label: 'MINIMIZAR / ENCERRAR', tag: 'MINIMIZA / ENCERRA', text: 'Você precisa aguardar o prazo.', effect: 'A resposta pode estar objetiva, mas a experiência apresentada desaparece e a continuidade fica pouco clara.' },
  { id: 'continuity', label: 'CONTINUIDADE', tag: 'CONDUZ', text: 'Se for necessário encaminhar, explico para onde e o que acontece a partir daí.', effect: 'Este trecho torna a continuidade compreensível sem prometer o resultado de outra etapa.' },
]
const replacements = [
  'Posso verificar o que está ao meu alcance agora e explicar os próximos movimentos.',
  'Vamos compreender o que ainda precisa ser feito e deixar claro o que acontece a partir daqui.',
  'Vou verificar o que consigo esclarecer neste momento e, se houver continuidade em outra etapa, explico como ela acontece.',
]
const mapItems = [
  { text: 'reconhecer o que a pessoa apresentou', area: 'care', effect: 'Reconhecer o relato é uma ação possível nesta conversa.' },
  { text: 'organizar o que já sabemos', area: 'care', effect: 'Organizar o que foi apresentado ajuda a conduzir a conversa agora.' },
  { text: 'esclarecer o próximo movimento possível', area: 'care', effect: 'O próximo movimento possível pode ser explicado com clareza.' },
  { text: 'explicar limites com clareza', area: 'care', effect: 'Explicar um limite também é um cuidado na interação.' },
  { text: 'confirmar entendimento', area: 'care', effect: 'Confirmar entendimento pode ser feito durante a conversa.' },
  { text: 'indicar o que pode ser verificado agora', area: 'care', effect: 'É possível indicar o que pode ser verificado neste momento.' },
  { text: 'garantir o resultado final', area: 'limit', effect: 'O resultado final depende de fatores além desta conversa.' },
  { text: 'garantir prazo de outra área', area: 'limit', effect: 'O prazo de outra área não pode ser garantido nesta interação.' },
  { text: 'garantir aprovação/processamento', area: 'limit', effect: 'Aprovação ou processamento dependem de outras etapas.' },
  { text: 'controlar a decisão ou ação de terceiros', area: 'limit', effect: 'A decisão ou ação de terceiros não está sob controle da pessoa atendente.' },
]
const transferOptions = ['Urgência ou prazo', 'Frustração ou reclamação', 'Dependência de outra área ou etapa', 'Expectativa de um resultado que eu não posso garantir', 'Outra situação', 'Prefiro não responder']
const reviewStates = [
  ['builder', '1 · Parte A: construtor inicial'], ['constructed', '2 · Resposta construída'],
  ['registered', '3 · Resposta registrada'], ['anatomy', '4 · Parte B: anatomia funcional'],
  ['problem', '5 · Promessa excessiva'], ['replacement', '6 · Escolhas de substituição'],
  ['comparison', '7 · Primeira resposta e ajustada'], ['map-initial', '8 · Parte C: mapa inicial'],
  ['map-classified', '9 · Mapa classificado'], ['next-care', '10 · Próximo cuidado possível'],
  ['transfer', '11 · Contexto opcional para OA 06'],
]
const el = (tag, cls = '', text) => {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text !== undefined) node.textContent = text
  return node
}
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const button = (action, text, secondary = false, disabled = false) => `<button type="button" class="oa05-${secondary ? 'secondary' : 'primary'}" data-action="${action}"${disabled ? ' disabled' : ''}>${text}</button>`
const actions = (...items) => `<div class="oa05-actions">${items.join('')}</div>`
const isProblem = (entry) => entry?.id === 'promise' || entry?.id === 'minimize'
const canonical = () => [blocks[0], blocks[1], blocks[4]]
const example = () => [blocks[0], blocks[2], blocks[4]]

export function OA05Page() {
  const state = { screen: 'builder', chosen: [], registered: null, working: null, replacingIndex: -1, replacement: null, classifications: {}, nextCare: null, transfer: null }
  const header = el('div', 'oa05-header')
  const title = el('div')
  const h1 = el('h1', '', 'Mapa de responsabilidade e ajuste da resposta')
  h1.tabIndex = -1
  title.append(el('p', 'oa05-kicker', 'OA 05  /  RESPOSTA E RESPONSABILIDADE'), h1,
    el('p', 'oa05-subtitle', 'Reconhecer a experiência, conduzir com clareza e preservar limites.'))
  const stepper = el('div', 'oa05-stepper')
  const steps = ['A  ·  Registre', 'B  ·  Revise', 'C  ·  Mapeie'].map((label, index) => {
    const step = el('span', '', label)
    step.dataset.part = ['a', 'b', 'c'][index]
    return step
  })
  stepper.append(steps[0], el('span', 'oa05-stepper__arrow', '→'), steps[1], el('span', 'oa05-stepper__arrow', '→'), steps[2])
  header.append(title, stepper)
  const workspace = el('div', 'oa05-workspace')
  const stage = el('div', 'oa05-stage')
  const review = el('div', 'oa05-review')
  const reviewLabel = el('label', '', 'Prévia de estados')
  const reviewSelect = el('select', 'oa05-review__select')
  reviewSelect.id = 'oa05-review-state'
  reviewLabel.htmlFor = reviewSelect.id
  reviewStates.forEach(([value, label]) => { const option = el('option', '', label); option.value = value; reviewSelect.append(option) })
  review.append(el('span', 'oa05-review__marker', 'REVISÃO DO MOCKUP'), reviewLabel, reviewSelect)
  workspace.append(stage, review)

  const current = () => state.working || state.registered || canonical()
  const problemIndex = () => current().findIndex(isProblem)
  const caseCard = () => `<section class="oa05-case" aria-label="Situação apresentada"><p class="oa05-label">SITUAÇÃO APRESENTADA</p><p>“${caseText}”</p></section>`
  const frame = (part, heading, detail, body) => `<div class="oa05-frame"><div class="oa05-frame__header"><p class="oa05-kicker">${part}</p><h2 tabindex="-1">${heading}</h2><p class="oa05-muted">${detail}</p></div>${body}</div>`
  const segment = (entry, index, anatomy = false) => `<li class="oa05-segment${isProblem(entry) && !['builder', 'constructed', 'registered'].includes(state.screen) ? ' is-problem' : ''}"><span class="oa05-segment__number">${String(index + 1).padStart(2, '0')}</span><div class="oa05-segment__body"><span class="oa05-tag">${['builder', 'constructed', 'registered'].includes(state.screen) ? entry.label : entry.tag || entry.label}</span><p>“${escapeHtml(entry.text)}”</p>${anatomy && entry.effect ? `<p class="oa05-segment__effect">${escapeHtml(entry.effect)}</p>` : ''}</div></li>`
  const response = (entries, label, anatomy = false) => `<section class="oa05-response" aria-label="${label}"><p class="oa05-label">${label}</p><ol class="oa05-response__list">${entries.map((entry, index) => segment(entry, index, anatomy)).join('')}</ol></section>`
  const continuity = (text) => `<aside class="oa05-continuity"><span class="oa05-continuity__line" aria-hidden="true"></span><p class="oa05-label">FIO DA ATIVIDADE</p><p>${text}</p></aside>`
  const layout = (main, side) => `<div class="oa05-layout"><div class="oa05-main">${main}</div>${side}</div>`

  function renderBuilder() {
    const selected = state.chosen.map((id) => blocks.find((entry) => entry.id === id))
    const available = blocks.filter((entry) => !state.chosen.includes(entry.id))
    let main = caseCard() + `<section class="oa05-builder"><div class="oa05-section-heading"><h3>Construa uma resposta curta</h3><span>${selected.length} de 2 ou 3 trechos</span></div>
      <p class="oa05-help">Escolha 2 ou 3 blocos. Use os botões para mudar a ordem ou remover um trecho.</p>
      ${selected.length ? `<ol class="oa05-builder__selected">${selected.map((entry, index) => `<li class="oa05-builder__item"><span class="oa05-builder__index">${String(index + 1).padStart(2, '0')}</span><div><strong>${entry.label}</strong><p>“${entry.text}”</p></div><div class="oa05-builder__tools">
        <button type="button" data-action="move-up" data-index="${index}" aria-label="Mover ${entry.label} para cima"${index === 0 ? ' disabled' : ''}>↑</button>
        <button type="button" data-action="move-down" data-index="${index}" aria-label="Mover ${entry.label} para baixo"${index === selected.length - 1 ? ' disabled' : ''}>↓</button>
        <button type="button" data-action="remove" data-index="${index}" aria-label="Remover ${entry.label}">×</button></div></li>`).join('')}</ol>`
      : '<p class="oa05-empty">Sua resposta começa aqui. Selecione um bloco ao lado.</p>'}</section>`
    main += actions(button('constructed', 'Ver resposta construída  →', false, selected.length < 2))
    const side = `<aside class="oa05-palette"><p class="oa05-label">BLOCOS DE RESPOSTA</p><p>Adicione um trecho por vez. A função de cada escolha aparece na revisão, depois do registro.</p>
      <div class="oa05-palette__list">${available.map((entry) => `<button type="button" class="oa05-palette__item" data-action="add" data-id="${entry.id}"${selected.length === 3 ? ' disabled' : ''}><strong>${entry.label}</strong><span>“${entry.text}”</span><span class="oa05-palette__add" aria-hidden="true">＋</span></button>`).join('')}</div></aside>`
    return frame('PARTE A  /  REGISTRE SUA RESPOSTA', 'Registre sua resposta', 'Monte uma resposta para a situação apresentada. A avaliação fica para depois.', layout(main, side))
  }

  function renderConstructed() {
    const entries = state.chosen.map((id) => blocks.find((entry) => entry.id === id))
    const main = caseCard() + response(entries, 'SUA RESPOSTA CONSTRUÍDA') + actions(button('builder', 'Editar trechos', true), button('registered', 'Registrar resposta  →'))
    return frame('PARTE A  /  RESPOSTA CONSTRUÍDA', 'Leia a resposta que você montou', 'Confira a sequência antes de registrar. Ainda não há avaliação dos trechos.', layout(main, continuity('A mesma resposta voltará na Parte B, com a função de cada trecho visível.')))
  }

  function renderRegistered() {
    const main = `<section class="oa05-notice" role="status"><h3>Resposta registrada. Vamos voltar a ela depois.</h3><p>A sequência que você escolheu está guardada nesta atividade.</p></section>` + response(state.registered, 'SUA RESPOSTA REGISTRADA') + actions(button('anatomy', 'Revisar minha resposta  →'))
    return frame('PARTE A  /  RESPOSTA REGISTRADA', 'Resposta registrada', 'Agora observe o efeito de cada trecho na conversa.', layout(main, continuity('Os trechos mantêm a ordem escolhida. Na próxima parte, cada um recebe uma etiqueta funcional.')))
  }

  function renderAnatomy() {
    const hasProblem = current().some(isProblem)
    const main = response(current(), 'SUA RESPOSTA INICIAL', true) + actions(button(hasProblem ? 'problem' : 'map-initial', hasProblem ? 'Observar trecho que pede ajuste  →' : 'Ir ao mapa de responsabilidade  →'))
    return frame('PARTE B  /  REVISE SUA RESPOSTA', 'O que cada trecho faz?', 'As etiquetas descrevem o efeito da frase na conversa, não a intenção de quem a escreveu.', layout(main, continuity('A sequência registrada aparece aqui, com etiquetas que nomeiam a função de cada trecho.')))
  }

  function renderProblem() {
    const index = problemIndex()
    if (index < 0) return renderAnatomy()
    const entry = current()[index]
    const main = response(current(), current().some((segment) => segment.id === 'adjusted') ? 'SUA RESPOSTA EM REVISÃO' : 'SUA RESPOSTA INICIAL', true) + `<section class="oa05-insight"><p class="oa05-label">${entry.tag}</p><h3>Este trecho muda o alcance da resposta.</h3><p>${entry.effect}</p></section>` + actions(button('replacement', 'Ajustar somente este trecho  →'))
    return frame('PARTE B  /  TRECHO EM FOCO', entry.id === 'promise' ? 'Quando a resposta promete demais' : 'Quando a conversa se encerra cedo', 'Observe o efeito deste trecho sem atribuir intenção à pessoa que responde.', layout(main, continuity('O ajuste incide somente sobre o trecho em foco. Os demais permanecem na mesma ordem.')))
  }

  function replacementOptions() {
    return current()[state.replacingIndex]?.id === 'minimize' ? [blocks[1].text, blocks[4].text, replacements[0]] : replacements
  }

  function renderReplacement() {
    const entry = current()[state.replacingIndex]
    if (!entry) return renderAnatomy()
    const main = `<section class="oa05-original"><p class="oa05-label">TRECHO A SUBSTITUIR · ${entry.tag}</p><p>“${entry.text}”</p></section>
      <fieldset class="oa05-replacements"><legend>Qual frase pode ocupar somente este lugar?</legend><p>Há mais de uma forma de conduzir a conversa com clareza e preservar limites.</p>
      ${replacementOptions().map((text, choice) => `<label class="oa05-replacement${state.replacement === choice ? ' is-selected' : ''}"><input type="radio" name="replacement" value="${choice}"${state.replacement === choice ? ' checked' : ''}><span class="oa05-replacement__letter">${'ABC'[choice]}</span><span>“${text}”</span></label>`).join('')}</fieldset>` + actions(button('comparison', 'Ver primeira resposta e ajustada  →', false, state.replacement === null))
    return frame('PARTE B  /  AJUSTE DA RESPOSTA', 'Substitua apenas este trecho', 'As outras partes da resposta continuam como foram construídas.', layout(main, continuity('A troca acontece no mesmo lugar da sequência. Nenhuma frase única é obrigatória.')))
  }

  function renderComparison() {
    const first = state.registered || example()
    const main = `<div class="oa05-comparison">${response(first, 'PRIMEIRA RESPOSTA')}${response(current(), 'RESPOSTA AJUSTADA')}</div>
      <section class="oa05-axis" aria-label="Ação, limite e próximo cuidado possível"><div><span>AÇÃO</span><p>Reconhecer o que foi apresentado e conduzir o que pode ser verificado agora.</p></div><div><span>LIMITE</span><p>Não garantir resultado, prazo ou decisão que dependem de outros fatores.</p></div><div><span>PRÓXIMO CUIDADO POSSÍVEL</span><p>Explicar com clareza o movimento seguinte e a continuidade da conversa.</p></div></section>` +
      actions(button(problemIndex() >= 0 ? 'problem' : 'map-initial', problemIndex() >= 0 ? 'Ajustar outro trecho  →' : 'Ir ao mapa de responsabilidade  →'))
    return frame('PARTE B  /  ANTES E DEPOIS', 'O que mudou na resposta?', 'Compare as funções dos trechos. O ajuste preserva a ordem e altera somente o segmento escolhido.', `<div class="oa05-main oa05-main--wide">${main}</div>`)
  }

  function mapBridge() {
    return `<div class="oa05-map-bridge"><div><p class="oa05-label">DA RESPOSTA AO MAPA</p><p>Reconhecer e conduzir continuam possíveis mesmo quando o resultado não pode ser garantido.</p></div><div class="oa05-map-bridge__tags">${current().map((entry) => `<span class="oa05-tag">${entry.tag || entry.label}</span>`).join('')}</div></div>`
  }

  function renderMapInitial() {
    const count = Object.values(state.classifications).filter(Boolean).length
    const main = mapBridge() + `<fieldset class="oa05-map-list"><legend>Onde cada ação ou limite se situa?</legend><p>Classifique pelo que pode ser cuidado nesta conversa e pelo que depende também de outros fatores.</p>
      <div class="oa05-map-list__grid">${mapItems.map((item, index) => `<div class="oa05-map-list__item"><label for="oa05-map-${index}">${item.text}</label><select id="oa05-map-${index}" name="classification" data-index="${index}"><option value="">Escolha uma área</option><option value="care"${state.classifications[index] === 'care' ? ' selected' : ''}>POSSO CUIDAR NESTA INTERAÇÃO</option><option value="limit"${state.classifications[index] === 'limit' ? ' selected' : ''}>NÃO DEPENDE EXCLUSIVAMENTE DE MIM</option></select></div>`).join('')}</div></fieldset>` + actions(button('map-classified', 'Ver mapa classificado  →', false, count !== mapItems.length))
    return frame('PARTE C  /  MAPA DE RESPONSABILIDADE', 'O que está ao meu alcance nesta conversa?', 'O mapa trata da responsabilidade de comunicar e conduzir, sem descrever procedimentos internos.', `<div class="oa05-main oa05-main--wide">${main}</div>`)
  }

  function renderMapClassified(askCare = false) {
    const differences = mapItems.filter((item, index) => state.classifications[index] && state.classifications[index] !== item.area)
    const columns = [['care', 'POSSO CUIDAR NESTA INTERAÇÃO'], ['limit', 'NÃO DEPENDE EXCLUSIVAMENTE DE MIM']]
    const map = `<div class="oa05-map-columns">${columns.map(([area, title]) => `<section class="oa05-map-area oa05-map-area--${area}"><h3>${title}</h3><ul>${mapItems.filter((item) => item.area === area).map((item) => `<li>${item.text}</li>`).join('')}</ul></section>`).join('')}</div>`
    let main = mapBridge() + map + `<section class="oa05-map-feedback"><p class="oa05-label">AÇÃO → LIMITE → PRÓXIMO CUIDADO POSSÍVEL</p><p>É possível reconhecer, organizar e explicar o que vem a seguir. O resultado final pode depender de outras pessoas ou etapas. Mesmo assim, a conversa pode continuar com clareza.</p>
      ${differences.length ? `<div class="oa05-map-feedback__review"><h3>Algumas escolhas merecem outra leitura</h3><ul>${differences.map((item) => `<li><strong>${item.text}:</strong> ${item.effect}</li>`).join('')}</ul></div>` : ''}</section>`
    if (askCare) {
      main += `<fieldset class="oa05-next-care"><legend>O que ainda pode ser cuidado nesta interação?</legend><p>Escolha um próximo cuidado possível, mesmo quando o resultado depende de outros fatores.</p>
        <div class="oa05-next-care__choices">${mapItems.filter((item) => item.area === 'care').map((item, index) => `<label class="oa05-next-care__choice${state.nextCare === index ? ' is-selected' : ''}"><input type="radio" name="next-care" value="${index}"${state.nextCare === index ? ' checked' : ''}><span>${item.text}</span></label>`).join('')}</div>
        ${state.nextCare !== null ? `<div class="oa05-next-care__feedback" role="status"><strong>Próximo cuidado possível:</strong> ${mapItems[state.nextCare].text}. O limite do resultado não encerra a responsabilidade de conduzir esta interação.</div>` : ''}</fieldset>`
      main += actions(button('transfer', 'Continuar  →', false, state.nextCare === null))
    } else main += `<section class="oa05-map-question"><h3>O que ainda pode ser cuidado nesta interação?</h3><p>O limite não é o fim da condução. Identifique uma ação possível agora.</p></section>` + actions(button('next-care', 'Escolher próximo cuidado  →'))
    return frame('PARTE C  /  MAPA DE RESPONSABILIDADE', askCare ? 'O limite não encerra a conversa' : 'Leia o mapa de responsabilidade', askCare ? 'Escolha uma ação possível nesta interação.' : 'Compare sua classificação com este mapa de ações e limites.', `<div class="oa05-main oa05-main--wide">${main}</div>`)
  }

  function renderTransfer() {
    const selected = state.transfer
    const main = `<section class="oa05-transfer"><p class="oa05-label">REFLEXÃO OPCIONAL</p><h3>Em qual tipo de situação esse equilíbrio costuma exigir mais atenção no seu dia a dia?</h3><p>Você pode escolher uma situação ou concluir sem responder.</p>
      <fieldset><legend class="oa05-sr-only">Situação para levar ao OA 06</legend>${transferOptions.map((option, index) => `<label class="oa05-transfer__option${selected === index ? ' is-selected' : ''}"><input type="radio" name="transfer" value="${index}"${selected === index ? ' checked' : ''}><span>${option}</span></label>`).join('')}</fieldset>
      ${selected !== null && selected !== 5 ? `<div class="oa05-transfer__carry" role="status"><span class="oa05-label">CONTEXTO SINALIZADO PARA OA 06</span><strong>${transferOptions[selected]}</strong><p>Esta escolha fica sinalizada nesta atividade como contexto para o OA 06.</p></div>` : ''}
      ${selected === 5 ? '<p class="oa05-transfer__quiet" role="status">Tudo bem seguir sem compartilhar uma situação.</p>' : ''}</section>` + actions('<a class="oa05-secondary" href="#/">Concluir e voltar ao índice  →</a>')
    return frame('PARTE C  /  TRANSFERÊNCIA OPCIONAL', 'Leve o equilíbrio para uma situação real', 'A reflexão é opcional e não impede a conclusão da atividade.', layout(main, continuity('Da resposta registrada ao ajuste, o mapa termina em um próximo cuidado possível.')))
  }

  function render(focus = false) {
    const part = ['builder', 'constructed', 'registered'].includes(state.screen) ? 'a' : ['anatomy', 'problem', 'replacement', 'comparison'].includes(state.screen) ? 'b' : 'c'
    steps.forEach((step) => { step.classList.toggle('is-current', step.dataset.part === part); step.setAttribute('aria-current', step.dataset.part === part ? 'step' : 'false') })
    reviewSelect.value = state.screen
    const screens = { builder: renderBuilder, constructed: renderConstructed, registered: renderRegistered, anatomy: renderAnatomy,
      problem: renderProblem, replacement: renderReplacement, comparison: renderComparison, 'map-initial': renderMapInitial,
      'map-classified': () => renderMapClassified(false), 'next-care': () => renderMapClassified(true), transfer: renderTransfer }
    stage.innerHTML = screens[state.screen]()
    if (focus) stage.querySelector('h2')?.focus({ preventScroll: true })
  }

  stage.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]')
    if (!target || target.disabled) return
    const action = target.dataset.action
    const index = Number(target.dataset.index)
    if (action === 'add') {
      if (state.chosen.length < 3 && !state.chosen.includes(target.dataset.id)) state.chosen.push(target.dataset.id)
      render()
      stage.querySelector(`[data-action="remove"][data-index="${state.chosen.length - 1}"]`)?.focus({ preventScroll: true })
      return
    }
    if (action === 'remove') {
      state.chosen.splice(index, 1)
      render()
      stage.querySelector('[data-action="add"]')?.focus({ preventScroll: true })
      return
    }
    if (action === 'move-up' || action === 'move-down') {
      const next = index + (action === 'move-up' ? -1 : 1)
      if (next < 0 || next >= state.chosen.length) return
      ;[state.chosen[index], state.chosen[next]] = [state.chosen[next], state.chosen[index]]
      render()
      stage.querySelector(`[data-action="${action}"][data-index="${next}"]`)?.focus({ preventScroll: true })
      return
    }
    if (action === 'registered') {
      state.registered = state.chosen.map((id) => blocks.find((entry) => entry.id === id))
      state.working = [...state.registered]
    }
    if (action === 'problem') state.replacingIndex = problemIndex()
    if (action === 'replacement') state.replacement = null
    if (action === 'comparison') {
      const original = current()[state.replacingIndex]
      const text = replacementOptions()[state.replacement]
      const tag = original.id === 'minimize' && state.replacement === 0 ? 'CONDUZ' : 'PRESERVA O LIMITE DE RESPONSABILIDADE'
      state.working = current().map((entry, itemIndex) => itemIndex === state.replacingIndex ? { id: 'adjusted', text, tag } : entry)
    }
    state.screen = action
    render(true)
  })

  stage.addEventListener('change', (event) => {
    const target = event.target
    if (target.name === 'replacement') {
      state.replacement = Number(target.value)
      target.closest('fieldset').querySelectorAll('.oa05-replacement').forEach((label) => label.classList.toggle('is-selected', label.contains(target)))
      stage.querySelector('[data-action="comparison"]').disabled = false
    }
    if (target.name === 'classification') {
      state.classifications[target.dataset.index] = target.value
      stage.querySelector('[data-action="map-classified"]').disabled = Object.values(state.classifications).filter(Boolean).length !== mapItems.length
    }
    if (target.name === 'next-care') {
      state.nextCare = Number(target.value)
      render()
      stage.querySelector(`input[name="next-care"][value="${state.nextCare}"]`)?.focus({ preventScroll: true })
    }
    if (target.name === 'transfer') {
      state.transfer = Number(target.value)
      render()
      stage.querySelector(`input[name="transfer"][value="${state.transfer}"]`)?.focus({ preventScroll: true })
    }
  })

  reviewSelect.addEventListener('change', () => {
    const screen = reviewSelect.value
    Object.assign(state, { screen, chosen: [], registered: null, working: null, replacingIndex: -1, replacement: null, classifications: {}, nextCare: null, transfer: null })
    if (['constructed', 'registered'].includes(screen)) {
      state.chosen = ['recognize', 'promise', 'continuity']
      if (screen === 'registered') state.registered = example()
    }
    if (['problem', 'replacement', 'comparison'].includes(screen)) {
      state.registered = example()
      state.working = [...state.registered]
      state.replacingIndex = 1
      if (screen === 'comparison') {
        state.replacement = 0
        state.working[1] = { id: 'adjusted', text: replacements[0], tag: 'PRESERVA O LIMITE DE RESPONSABILIDADE' }
      }
    }
    if (['map-initial', 'map-classified', 'next-care', 'transfer'].includes(screen)) {
      state.registered = example()
      state.working = [blocks[0], { id: 'adjusted', text: replacements[0], tag: 'PRESERVA O LIMITE DE RESPONSABILIDADE' }, blocks[4]]
      if (screen !== 'map-initial') state.classifications = Object.fromEntries(mapItems.map((item, index) => [index, item.area]))
      if (screen === 'transfer') state.nextCare = 0
    }
    render(true)
  })

  render()
  return AppShell({ pageHeader: header, workspace, home: true, contextTitle: 'OA 05' })
}
