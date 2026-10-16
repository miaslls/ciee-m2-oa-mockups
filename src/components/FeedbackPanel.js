export function FeedbackPanel({ title, text, tone = 'neutral' }) {
  const panel = document.createElement('section')
  panel.className = `feedback-panel feedback-panel--${tone}`
  panel.setAttribute('role', 'status')
  panel.setAttribute('aria-live', 'polite')
  if (title) {
    const heading = document.createElement('h2')
    heading.textContent = title
    panel.append(heading)
  }
  if (text) {
    const body = document.createElement('p')
    body.textContent = text
    panel.append(body)
  }
  return panel
}
