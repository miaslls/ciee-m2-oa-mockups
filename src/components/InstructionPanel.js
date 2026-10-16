export function InstructionPanel({ title, text }) {
  const panel = document.createElement('section')
  panel.className = 'instruction-panel'
  if (title) {
    const heading = document.createElement('h2')
    heading.textContent = title
    panel.append(heading)
  }
  const body = document.createElement('p')
  body.textContent = text
  panel.append(body)
  return panel
}
