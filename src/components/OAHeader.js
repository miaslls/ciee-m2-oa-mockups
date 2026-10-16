export function OAHeader({ number, title }) {
  const header = document.createElement('div')
  header.className = 'oa-header'
  const eyebrow = document.createElement('p')
  eyebrow.className = 'oa-header__eyebrow'
  eyebrow.textContent = `OA ${number}`
  const heading = document.createElement('h1')
  heading.textContent = title
  heading.tabIndex = -1
  header.append(eyebrow, heading)
  return header
}
