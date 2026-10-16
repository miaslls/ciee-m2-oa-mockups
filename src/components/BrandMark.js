export function BrandMark() {
  const mark = document.createElement('span')
  mark.className = 'brand-mark'
  const fallback = document.createElement('span')
  fallback.className = 'brand-mark__fallback'
  fallback.setAttribute('aria-label', 'CIEE, marca provisória para desenvolvimento')
  fallback.innerHTML = 'CIEE <small>placeholder</small>'
  const logo = document.createElement('img')
  logo.className = 'brand-mark__image'
  logo.alt = 'CIEE'
  logo.hidden = true
  logo.addEventListener('load', () => {
    logo.hidden = false
    fallback.hidden = true
  })
  logo.src = '/assets/logo/logo-CIEE-blue.svg'
  mark.append(fallback, logo)
  return mark
}
