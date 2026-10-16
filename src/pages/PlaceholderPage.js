import { ActionBar } from '../components/ActionBar.js'
import { AppShell } from '../components/AppShell.js'
import { InstructionPanel } from '../components/InstructionPanel.js'
import { OAHeader } from '../components/OAHeader.js'

export function PlaceholderPage(oa) {
  const back = document.createElement('a')
  back.className = 'text-link'
  back.href = '#/'
  back.textContent = 'Voltar ao índice'
  return AppShell({
    pageHeader: OAHeader(oa),
    instruction: InstructionPanel({ text: 'Mockup ainda não implementado.' }),
    actions: ActionBar({ navigation: back }),
    contextTitle: `OA ${oa.number}`,
  })
}
