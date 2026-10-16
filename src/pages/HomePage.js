import { AppShell } from '../components/AppShell.js'
import { Card } from '../components/Card.js'
import { Tag } from '../components/Tag.js'
import { oaIndex } from '../data/oa-index.js'

export function HomePage() {
  const intro = document.createElement('div')
  intro.className = 'home-intro'
  const eyebrow = document.createElement('p')
  eyebrow.className = 'home-intro__eyebrow'
  eyebrow.textContent = 'Módulo 2'
  const heading = document.createElement('h1')
  heading.textContent = 'Objetos de Aprendizagem'
  heading.tabIndex = -1
  intro.append(eyebrow, heading)

  const grid = document.createElement('div')
  grid.className = 'oa-grid'
  grid.setAttribute('aria-label', 'Objetos de Aprendizagem do Módulo 2')
  for (const oa of oaIndex) {
    const number = document.createElement('span')
    number.className = 'oa-card__number'
    number.textContent = `OA ${oa.number}`
    const title = document.createElement('h2')
    title.className = 'oa-card__title'
    title.textContent = oa.title
    const bottom = document.createElement('div')
    bottom.className = 'oa-card__bottom'
    bottom.append(Tag({ text: Number(oa.number) <= 3 ? 'Disponível' : 'A implementar' }))
    const arrow = document.createElement('span')
    arrow.className = 'oa-card__arrow'
    arrow.textContent = '→'
    arrow.setAttribute('aria-hidden', 'true')
    bottom.append(arrow)
    grid.append(Card({ href: oa.route, className: 'oa-card', children: [number, title, bottom] }))
  }
  return AppShell({ pageHeader: intro, workspace: grid, contextTitle: 'Objetos de Aprendizagem', home: true })
}
