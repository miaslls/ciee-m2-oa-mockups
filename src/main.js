import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/roboto/latin-400.css'
import '@fontsource/roboto/latin-500.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/global.css'
import './styles/components.css'
import './styles/mockup.css'
import { startRouter } from './router.js'

startRouter(document.querySelector('#app'))
