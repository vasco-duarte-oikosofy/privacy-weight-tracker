import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  </StrictMode>,
)
   