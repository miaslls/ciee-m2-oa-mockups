import { BrandMark } from './BrandMark.js'

export function AppShell({ pageHeader, instruction, workspace, feedback, actions, contextTitle, progress, home = false } = {}) {
  const shell = document.createElement('div')
  shell.className = 'app-shell'
  const header = document.createElement('header')
  header.className = 'app-shell__header'
  const headerInner = document.createElement('div')
  headerInner.className = 'app-shell__header-inner content-container'
  const brandLink = document.createElement('a')
  brandLink.className = 'app-shell__brand-link'
  brandLink.href = '#/'
  brandLink.setAttribute('aria-label', 'CIEE: voltar ao índice')
  brandLink.append(BrandMark())
  const course = document.createElement('div')
  course.className = 'app-shell__course'
  const courseName = document.createElement('span')
  courseName.className = 'app-shell__course-name'
  courseName.textContent = 'Cultura de Excelência no Atendimento'
  const module = document.createElement('span')
  module.className = 'app-shell__module'
  module.textContent = 'Módulo 2'
  course.append(courseName, module)
  const headerEnd = document.createElement('div')
  headerEnd.className = 'app-shell__header-end'
  if (contextTitle) {
    const context = document.createElement('span')
    context.className = 'app-shell__context'
    context.textContent = contextTitle
    headerEnd.append(context)
  }
  if (progress) headerEnd.append(progress)
  headerInner.append(brandLink, course, headerEnd)
  header.append(headerInner)

  const main = document.createElement('main')
  main.className = 'app-shell__main content-container'
  main.id = 'main-content'
  if (pageHeader) main.append(pageHeader)
  if (instruction || workspace || feedback) {
    const stage = document.createElement('div')
    stage.className = home ? 'mockup-stage mockup-stage--open' : 'mockup-stage'
    if (instruction) stage.append(instruction)
    if (workspace) stage.append(workspace)
    if (feedback) stage.append(feedback)
    main.append(stage)
  }
  shell.append(header, main)
  if (actions) {
    const footer = document.createElement('footer')
    footer.className = 'app-shell__actions'
    const inner = document.createElement('div')
    inner.className = 'content-container'
    inner.append(actions)
    footer.append(inner)
    shell.append(footer)
  }
  return shell
}
