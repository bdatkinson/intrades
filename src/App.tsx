import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'
import './styles/global.css'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './features/auth/ProtectedRoute'
import { SkeletonCard } from './components/ui/SkeletonCard'

const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const Workbench = lazy(() => import('./features/designer/Workbench').then(m => ({ default: m.Workbench })))
const Showcase = lazy(() => import('./components/cards/Showcase').then(m => ({ default: m.Showcase })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/designer" replace />} />
            <Route path="/deck" element={<ProtectedRoute><Showcase /></ProtectedRoute>} />
            <Route path="/designer" element={<ProtectedRoute><Workbench /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="h-6 w-32 rounded-none bg-zinc-800 animate-pulse mx-auto mb-2" />
          <div className="h-4 w-48 rounded-none bg-zinc-800 animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><SkeletonCard count={4} /></div>
      </div>
    </div>
  )
}

export default App
