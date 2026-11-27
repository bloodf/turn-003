import { createApp } from 'vue'
import '@fontsource-variable/jost/wght.css'
import '@fontsource/grenze/latin-400.css'
import '@fontsource/grenze/latin-400-italic.css'
import '@fontsource/grenze/latin-700.css'
import '@fontsource/grenze/latin-800.css'
import './ui/theme.css'
import App from './ui/App.vue'
import { tip } from './ui/tip'
createApp(App).directive('tip', tip).mount('#app')
import * as session from './session'
import { PRESETS } from './core/presets'
;(window as any).__rw = { ...session, PRESETS }   // handy in the console, used by the end-to-end tests
