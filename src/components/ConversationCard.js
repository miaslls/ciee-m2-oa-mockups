export function ConversationCard({ speaker, text, parts, variant }) {
  const card = document.createElement('div')
  card.className = `conversation-card conversation-card--${variant}`
  const top = document.createElement('div')
  top.className = 'conversation-card__top'
  const icon = document.createElement('span')
  icon.className = 'conversation-card__icon'
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = variant === 'person' ? 'P' : 'A'
  const label = document.createElement('span')
  label.className = 'conversation-card__speaker'
  label.textContent = speaker
  top.append(icon, label)
  const speech = document.createElement('p')
  speech.className = 'conversation-card__speech'
  if (parts) {
    for (const part of parts) {
      if (part.cue) {
        const cue = document.createElement('span')
        cue.dataset.cue = ''
        cue.className = 'conversation-card__cue'
        cue.textContent = part.text
        speech.append(cue)
      } else speech.append(document.createTextNode(part.text))
    }
  } else speech.textContent = text
  card.append(top, speech)
  return card
}
