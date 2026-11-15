import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/500.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import '@fontsource/atkinson-hyperlegible-next/800.css';
import '@fontsource/atkinson-hyperlegible-mono/400.css';
import './styles/global.css'
import App from './App.tsx'
import { startupPrefetch } from './core/data/startup-prefetch'

if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('tune')) {
  void import('./view/tune/TunePanel').then(({ initTunePanel }) => {
    initTunePanel();
  });
}

startupPrefetch(window.location)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
