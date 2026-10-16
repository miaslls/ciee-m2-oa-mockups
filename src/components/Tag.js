export function Tag({ text, tone = 'neutral' }) {
  const tag = document.createElement('span')
  tag.className = `tag tag--${tone}`
  tag.textContent = text
  return tag
}
