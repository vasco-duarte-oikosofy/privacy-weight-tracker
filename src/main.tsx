import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { InsightsPage } from '@/pages/InsightsPage'
import { Navigation, type Page } from '@/components/Navigation'
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/ThemeToggle";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { isDark } = useTheme();

  return (
    <>
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {currentPage === "home" ? <HomePage /> : <InsightsPage />}
      <Toaster richColors closeButton theme={isDark ? 'dark' : 'light'} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
   