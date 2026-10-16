export function Card({ children = [], href, className = '' } = {}) {
  const card = document.createElement(href ? 'a' : 'article')
  card.className = `card ${className}`.trim()
  if (href) card.href = href
  card.append(...(Array.isArray(children) ? children : [children]))
  return card
}
