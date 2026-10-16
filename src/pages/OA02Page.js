import { AppShell } from '../components/AppShell.js'
import { gapCards, gapMessage, gapZones, recapBlocks, recapMessage } from '../data/oa02-items.js'
import '../styles/oa02.css'

const previews = [
  ['a-initial', 'Etapa A · início'],
  ['a-built', 'Etapa A · recapitulação construída'],
  ['a-evidence', 'Etapa A · trilha de evidências'],
  ['a-assumption', 'Etapa A · suposição introduzida'],
  ['b-initial', 'Etapa B · classificação inicial'],
  ['b-partial', 'Etapa B · classificação parcial'],
  ['b-feedback', 'Etapa B · feedback explicativo'],
  ['bridge', 'Ponte para OA 03 · síntese'],
]

function el(tag, className = '', text) {
  const node = document.createElement(tag)
  node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function button(text, className, action, label) {
  const node = el('button', className, text)
  node.type = 'button'
  if (label) node.setAttribute('aria-label', label)
  node.addEventListener('click', action)
  return node
}

function heading(kicker, title, detail) {
  const group = el('div', 'oa02-heading')
  group.append(el('p', 'oa02-kicker', kicker))
  const h2 = el('h2', '', title)
  h2.tabIndex = -1
  group.append(h2, el('p', 'oa02-heading__detail', detail))
  return group
}

export function OA02Page() {
  const state = { stage: 'a', blocks: [], checked: false, placements: {}, selected: null, last: null, gap: null }
  const header = el('div', 'oa02-header')
  const title = el('div')
  title.append(el('p', 'oa02-kicker', 'OA 02  /  PRÁTICA DE RECAPITULAÇÃO'))
  const h1 = el('h1', '', 'Construtor de recapitulação e lacunas')
  h1.tabIndex = -1
  title.append(h1)
  const steps = el('div', 'oa02-steps')
  steps.setAttribute('aria-label', 'Etapas do objeto de aprendizagem')
  const stepA = el('div', 'oa02-steps__item')
  const stepB = el('div', 'oa02-steps__item')
  stepA.append(el('span', 'oa02-steps__number', '01'), el('span', '', 'Construir a recapitulação'))
  stepB.append(el('span', 'oa02-steps__number', '02'), el('span', '', 'Identificar as lacunas'))
  steps.append(stepA, el('span', 'oa02-steps__arrow', '→'), stepB)
  header.append(title, steps)

  const workspace = el('div', 'oa02-workspace')
  const stage = el('div', 'oa02-stage')
  const review = el('div', 'oa02-review')
  const reviewSelect = el('select', 'oa02-review__select')
  reviewSelect.id = 'oa02-review-state'
  const reviewLabel = el('label', '', 'Prévia de estados')
  reviewLabel.htmlFor = reviewSelect.id
  previews.forEach(([value, label]) => {
    const option = el('option', '', label)
    option.value = value
    reviewSelect.append(option)
  })
  review.append(el('span', 'oa02-review__marker', 'REVISÃO DO MOCKUP'), reviewLabel, reviewSelect)
  workspace.append(stage, review)

  const focus = (selector) => stage.querySelector(selector)?.focus({ preventScroll: true })
  function setStep(name) {
    stepA.classList.toggle('is-current', name === 'a')
    stepB.classList.toggle('is-current', name !== 'a')
    stepA.setAttribute('aria-current', name === 'a' ? 'step' : 'false')
    stepB.setAttribute('aria-current', name !== 'a' ? 'step' : 'false')
  }
  function strip(current) {
    const node = el('div', 'oa02-strip')
    node.setAttribute('aria-label', 'Raciocínio em duas etapas')
    node.append(
      el('span', current === 'a' ? 'is-current' : '', 'APRESENTADO'),
      el('span', 'oa02-strip__arrow', '→'),
      el('span', '', 'PRESUMIDO'),
      el('span', 'oa02-strip__arrow', '→'),
      el('span', current === 'b' ? 'is-current' : '', 'AINDA NECESSÁRIO'),
    )
    return node
  }
  function frameTop(kicker, title, detail, current) {
    const top = el('div', 'oa02-frame__top')
    top.append(heading(kicker, title, detail), strip(current))
    return top
  }
  function source() {
    const node = el('section', 'oa02-source')
    node.append(el('p', 'oa02-kicker', 'MENSAGEM DA PESSOA'))
    const quote = el('blockquote', 'oa02-source__quote')
    if (!state.checked) quote.textContent = recapMessage
    else {
      quote.append('Eu ')
      const first = el('mark', 'oa02-source__mark', 'atualizei meus dados ontem')
      first.append(el('span', 'oa02-source__ref', 'FONTE 01'))
      quote.append(first, ', mas ')
      const second = el('mark', 'oa02-source__mark', 'continuo recebendo uma mensagem dizendo que meu cadastro está incompleto')
      second.append(el('span', 'oa02-source__ref', 'FONTE 02'))
      quote.append(second, '.')
    }
    node.append(quote)
    if (state.checked) node.append(el('p', 'oa02-source__note', 'Trechos numerados correspondem aos rótulos dos blocos abaixo.'))
    return node
  }
  function evidence() {
    const node = el('div', 'oa02-evidence')
    const h3 = el('h3', '', 'Trilha de evidências')
    h3.tabIndex = -1
    node.append(h3)
    const supported = state.blocks.some((id) => recapBlocks.find((item) => item.id === id).kind === 'supported')
    const unsourced = state.blocks.some((id) => recapBlocks.find((item) => item.id === id).kind !== 'supported')
    if (supported) {
      const note = el('div', 'oa02-evidence__note')
      note.append(el('strong', '', 'INFORMAÇÃO SUSTENTADA'), el('p', '', 'Esta parte da recapitulação corresponde ao que a pessoa apresentou. É possível localizar a informação que sustenta a formulação.'))
      node.append(note)
    }
    if (unsourced) {
      const note = el('div', 'oa02-evidence__note oa02-evidence__note--unsourced')
      note.append(el('strong', '', 'SUPOSIÇÃO INTRODUZIDA'), el('p', '', 'Esta explicação ainda não foi apresentada nem confirmada. Ela pode ser possível, mas não deve entrar na recapitulação como se fosse um fato.'))
      if (state.blocks.includes('intent')) note.append(el('p', 'oa02-evidence__detail', 'A intenção também precisa de apoio no contexto apresentado; não está automaticamente confirmada.'))
      if (state.blocks.some((id) => recapBlocks.find((item) => item.id === id).kind === 'assumption')) note.append(el('p', 'oa02-evidence__detail', 'De onde veio essa informação? Ela não aparece na mensagem da pessoa. É uma explicação possível, mas ainda não confirmada.'))
      node.append(note)
    }
    return node
  }
  function move(index, delta) {
    const next = index + delta
    if (next < 0 || next >= state.blocks.length) return
    ;[state.blocks[index], state.blocks[next]] = [state.blocks[next], state.blocks[index]]
    const id = state.blocks[next]
    state.checked = false
    renderA()
    focus(`[data-remove-id="${id}"]`)
  }
  function renderA() {
    state.stage = 'a'
    reviewSelect.value = state.checked
      ? state.blocks.some((id) => recapBlocks.find((item) => item.id === id).kind !== 'supported') ? 'a-assumption' : 'a-evidence'
      : state.blocks.length ? 'a-built' : 'a-initial'
    setStep('a')
    const frame = el('div', 'oa02-frame')
    frame.append(frameTop('ETAPA 01 / CONSTRUIR A RECAPITULAÇÃO', 'De onde veio esta informação?', 'Antes de construir qualquer orientação, formule uma recapitulação.', 'a'))
    const layout = el('div', 'oa02-a-layout')
    const left = el('div', 'oa02-a-layout__source')
    left.append(source())
    if (state.checked) left.append(el('p', 'oa02-source__connector', '↘  A fonte é identificada por número e por texto em cada bloco.'))
    const builder = el('section', 'oa02-builder')
    builder.append(el('p', 'oa02-kicker', 'SUA RECAPITULAÇÃO'))
    const sentence = el('div', 'oa02-sentence')
    sentence.append(el('p', 'oa02-sentence__lead', 'Se entendi corretamente...'))
    const list = el('ol', 'oa02-selected')
    list.setAttribute('aria-label', 'Blocos da recapitulação, em ordem')
    if (!state.blocks.length) list.append(el('li', 'oa02-selected__empty', 'Escolha os blocos abaixo para compor a frase.'))
    state.blocks.forEach((id, index) => {
      const item = recapBlocks.find((block) => block.id === id)
      const row = el('li', 'oa02-selected__item')
      row.append(el('span', 'oa02-selected__order', String(index + 1).padStart(2, '0')), el('span', 'oa02-selected__text', index ? `e ${item.text}` : item.text))
      if (state.checked) {
        row.classList.add(item.kind === 'supported' ? 'is-supported' : 'is-unsourced')
        row.append(el('span', 'oa02-selected__source', item.kind === 'supported' ? `Fonte ${item.source} na mensagem` : item.kind === 'intent' ? 'Intenção a confirmar · sem fonte' : 'Sem origem na mensagem'))
      }
      const controls = el('div', 'oa02-selected__controls')
      const up = button('↑', 'oa02-icon', () => move(index, -1), `Mover ${item.text} para cima`)
      const down = button('↓', 'oa02-icon', () => move(index, 1), `Mover ${item.text} para baixo`)
      up.disabled = index === 0
      down.disabled = index === state.blocks.length - 1
      const remove = button('×', 'oa02-icon', () => {
        state.blocks.splice(index, 1)
        state.checked = false
        renderA()
        focus(`[data-bank-id="${id}"]`)
      }, `Remover ${item.text} da recapitulação`)
      remove.dataset.removeId = id
      controls.append(up, down, remove)
      row.append(controls)
      list.append(row)
    })
    sentence.append(list)
    builder.append(sentence)
    if (state.checked) builder.append(evidence())
    else {
      builder.append(el('p', 'oa02-builder__hint', 'Selecione, remova ou use as setas para ordenar. A origem aparece após Conferir.'))
      const bank = el('div', 'oa02-bank')
      bank.append(el('p', 'oa02-kicker', 'BLOCOS DISPONÍVEIS'))
      const grid = el('div', 'oa02-bank__grid')
      recapBlocks.filter((block) => !state.blocks.includes(block.id)).forEach((block) => {
        const add = button(block.text, 'oa02-bank__button', () => {
          state.blocks.push(block.id)
          renderA()
          focus(`[data-remove-id="${block.id}"]`)
        }, `Adicionar: ${block.text}`)
        add.dataset.bankId = block.id
        grid.append(add)
      })
      bank.append(grid)
      builder.append(bank)
    }
    const actions = el('div', 'oa02-actions')
    if (state.checked) {
      actions.append(button('Editar recapitulação', 'oa02-secondary', () => {
        state.checked = false
        renderA()
        focus('.oa02-bank__button')
      }))
      actions.append(button('Continuar  →', 'oa02-primary', () => {
        renderB()
        focus('.oa02-heading h2')
      }))
    } else {
      const check = button('Conferir  →', 'oa02-primary', () => {
        state.checked = true
        renderA()
        focus('.oa02-evidence h3')
      })
      check.disabled = !state.blocks.length
      actions.append(check)
    }
    builder.append(actions)
    layout.append(left, builder)
    frame.append(layout)
    stage.replaceChildren(frame)
  }
  function cardButton(card) {
    const selected = state.selected === card.id
    const node = button(card.text, `oa02-b-card${selected ? ' is-selected' : ''}`, () => {
      state.selected = selected ? null : card.id
      renderB()
      focus(`[data-card-id="${card.id}"]`)
    }, `${card.text}${selected ? ', selecionado' : ''}`)
    node.dataset.cardId = card.id
    node.setAttribute('aria-pressed', String(selected))
    return node
  }
  function place(zoneId) {
    if (!state.selected) return
    state.placements[state.selected] = zoneId
    state.last = { cardId: state.selected, zoneId }
    state.selected = null
    renderB()
    focus('.oa02-b-feedback h3')
  }
  function feedback() {
    const card = gapCards.find((item) => item.id === state.last.cardId)
    const correct = card.expected === state.last.zoneId
    const node = el('div', 'oa02-b-feedback__panel')
    const h3 = el('h3', '', card.expected === 'informed' ? 'INFORMAÇÃO APRESENTADA' : card.expected === 'needed' ? 'LACUNA NECESSÁRIA' : 'CONCLUSÃO DESNECESSÁRIA')
    h3.tabIndex = -1
    node.append(h3)
    if (!correct) node.append(el('p', 'oa02-b-feedback__correction', `Esta informação cabe em “${gapZones.find((zone) => zone.id === card.expected).title}”. Selecione o cartão para mudar sua área.`))
    const copy = card.expected === 'informed'
      ? 'A pessoa informou que existe uma dificuldade de acesso.'
      : card.expected === 'needed'
        ? 'Esta informação ainda não está disponível e pode ser necessária antes de construir uma orientação.'
        : 'Não precisamos preencher todas as lacunas possíveis. O foco é identificar a informação necessária para compreender a situação e decidir o próximo passo.'
    node.append(el('p', '', copy))
    return node
  }
  function renderB() {
    state.stage = 'b'
    reviewSelect.value = state.last ? 'b-feedback' : Object.keys(state.placements).length ? 'b-partial' : 'b-initial'
    setStep('b')
    const frame = el('div', 'oa02-frame')
    frame.append(frameTop('ETAPA 02 / IDENTIFICAR AS LACUNAS', 'O que ainda preciso compreender?', 'Recapitular não é preencher o que ainda não foi informado.', 'b'))
    const caseBar = el('div', 'oa02-b-case')
    caseBar.append(el('span', 'oa02-kicker', 'NOVA MENSAGEM'), el('q', '', gapMessage), el('p', '', 'Organize as informações de acordo com o que já sabemos e o que ainda precisamos compreender.'))
    frame.append(caseBar)
    const distinction = el('div', 'oa02-distinction')
    distinction.append(el('strong', '', 'Não sabemos'), el('span', '', '≠'), el('strong', '', 'Precisamos saber agora'), el('p', '', 'Identifique apenas a informação necessária para compreender a situação e decidir o próximo passo.'))
    frame.append(distinction)
    const layout = el('div', 'oa02-b-layout')
    const bank = el('section', 'oa02-b-bank')
    bank.append(el('p', 'oa02-kicker', 'INFORMAÇÕES PARA ORGANIZAR'))
    const bankList = el('div', 'oa02-b-bank__list')
    const unplaced = gapCards.filter((card) => !state.placements[card.id])
    if (!unplaced.length) bankList.append(el('p', 'oa02-b-bank__empty', 'Todas as informações foram organizadas.'))
    unplaced.forEach((card) => bankList.append(cardButton(card)))
    bank.append(bankList, el('p', 'oa02-b-bank__hint', 'Selecione um cartão e depois escolha uma das três áreas.'))
    const map = el('section', 'oa02-map')
    map.setAttribute('aria-label', 'Mapa de informações e lacunas')
    gapZones.forEach((zone) => {
      const zoneNode = el('div', `oa02-zone oa02-zone--${zone.id}`)
      const head = el('div', 'oa02-zone__head')
      head.append(el('span', 'oa02-zone__index', zone.index))
      const title = el('div')
      title.append(el('h3', '', zone.title), el('p', '', zone.description))
      head.append(title)
      const choose = button('Colocar aqui', 'oa02-zone__choose', () => place(zone.id), `Colocar cartão selecionado em ${zone.title}`)
      choose.dataset.zoneId = zone.id
      choose.disabled = !state.selected
      head.append(choose)
      zoneNode.append(head)
      const items = el('div', 'oa02-zone__items')
      const placed = gapCards.filter((card) => state.placements[card.id] === zone.id)
      if (!placed.length) items.append(el('p', 'oa02-zone__empty', 'Nenhuma informação nesta área ainda.'))
      placed.forEach((card) => {
        const row = el('div', 'oa02-zone__item')
        row.append(cardButton(card))
        if (zone.id === 'needed' && card.expected === 'needed') row.append(button('Levar esta lacuna adiante  →', 'oa02-zone__bridge', () => {
          state.gap = card.id
          renderBridge()
          focus('.oa02-bridge h2')
        }))
        items.append(row)
      })
      zoneNode.append(items)
      map.append(zoneNode)
    })
    layout.append(bank, map)
    frame.append(layout)
    const feedbackHost = el('div', 'oa02-b-feedback')
    feedbackHost.setAttribute('role', 'status')
    feedbackHost.setAttribute('aria-live', 'polite')
    if (state.last) feedbackHost.append(feedback())
    frame.append(feedbackHost)
    stage.replaceChildren(frame)
  }
  function renderBridge() {
    state.stage = 'bridge'
    reviewSelect.value = 'bridge'
    setStep('b')
    const chosen = gapCards.find((card) => card.id === state.gap) ?? gapCards[2]
    const frame = el('div', 'oa02-frame oa02-frame--bridge')
    frame.append(strip('b'))
    const bridge = el('section', 'oa02-bridge')
    bridge.append(el('p', 'oa02-kicker', 'SÍNTESE  /  PONTE PARA OA 03'))
    const h2 = el('h2', '', 'Agora sabemos o que precisamos compreender melhor.')
    h2.tabIndex = -1
    bridge.append(h2)
    const gap = el('div', 'oa02-bridge__gap')
    gap.append(el('span', '', 'LACUNA SELECIONADA'), el('strong', '', chosen.text))
    bridge.append(gap)
    const synthesis = el('div', 'oa02-bridge__synthesis')
    synthesis.append(
      el('p', '', 'Uma recapitulação usa o que foi apresentado.'),
      el('p', '', 'Uma lacuna não precisa ser preenchida com uma suposição.'),
      el('p', '', 'Antes de orientar, identifique o que realmente precisa ser compreendido.'),
    )
    bridge.append(synthesis)
    const actions = el('div', 'oa02-actions')
    actions.append(button('Rever mapa de lacunas', 'oa02-secondary', () => {
      renderB()
      focus('.oa02-heading h2')
    }))
    const back = el('a', 'oa02-primary', 'Voltar ao índice  →')
    back.href = '#/'
    actions.append(back)
    bridge.append(actions)
    frame.append(bridge)
    stage.replaceChildren(frame)
  }
  function loadPreview(value) {
    state.blocks = []
    state.checked = false
    state.placements = {}
    state.selected = null
    state.last = null
    state.gap = null
    if (value === 'a-built') state.blocks = ['updated', 'message']
    if (value === 'a-evidence') { state.blocks = ['updated', 'message']; state.checked = true }
    if (value === 'a-assumption') { state.blocks = ['updated', 'message', 'processing']; state.checked = true }
    if (['b-partial', 'b-feedback', 'bridge'].includes(value)) {
      state.placements = { difficulty: 'informed', which: 'needed', happens: 'needed' }
      if (value === 'b-feedback') state.last = { cardId: 'which', zoneId: 'needed' }
      if (value === 'bridge') state.gap = 'happens'
    }
    if (value === 'bridge') renderBridge()
    else if (value.startsWith('b-')) renderB()
    else renderA()
  }
  reviewSelect.addEventListener('change', () => {
    loadPreview(reviewSelect.value)
    focus('.oa02-heading h2, .oa02-bridge h2')
  })
  loadPreview('a-initial')
  return AppShell({ pageHeader: header, workspace, home: true, contextTitle: 'OA 02' })
}
