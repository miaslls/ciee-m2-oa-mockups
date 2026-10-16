import { HomePage } from './pages/HomePage.js'
import { OA01Page } from './pages/OA01Page.js'
import { OA02Page } from './pages/OA02Page.js'
import { OA03Page } from './pages/OA03Page.js'
import { OA04Page } from './pages/OA04Page.js'
import { OA05Page } from './pages/OA05Page.js'
import { OA06Page } from './pages/OA06Page.js'
import { oaIndex } from './data/oa-index.js'

const pages = [OA01Page, OA02Page, OA03Page, OA04Page, OA05Page, OA06Page]
const routes = new Map([['#/', { render: HomePage, title: 'Objetos de Aprendizagem' }]])
oaIndex.forEach((oa, index) => routes.set(oa.route, { render: pages[index], title: oa.title }))

export function startRouter(root) {
  if (!root) throw new Error('Elemento raiz #app não encontrado')
  let initialRender = true

  function render() {
    const route = routes.get(window.location.hash || '#/') ?? routes.get('#/')
    root.replaceChildren(route.render())
    document.title = `${route.title} | CIEE · Módulo 2`
    if (!initialRender) {
      root.querySelector('h1')?.focus({ preventScroll: true })
      window.scrollTo(0, 0)
    }
    initialRender = false
  }

  window.addEventListener('hashchange', render)
  render()
}
