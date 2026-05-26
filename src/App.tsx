import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'
import './styles/global.css'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './features/auth/ProtectedRoute'

const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const DeckView = lazy(() => import('./features/deck/components/DeckView'))
const MentorGrid = lazy(() => import('./features/mentors/components/MentorGrid'))
const MentorDetailPage = lazy(() => import('./features/mentors/components/MentorDetailPage'))
const MentorChatPage = lazy(() => import('./features/mentors/components/MentorChatPage'))
const BRTPage = lazy(() => import('./features/brt/BRTPage').then(m => ({ default: m.BRTPage })))
const BusinessNameStep = lazy(() => import('./features/brt/steps/BusinessNameStep').then(m => ({ default: m.BusinessNameStep })))
const LLCFilingStep = lazy(() => import('./features/brt/steps/LLCFilingStep').then(m => ({ default: m.LLCFilingStep })))
const BankInsuranceStep = lazy(() => import('./features/brt/steps/BankInsuranceStep').then(m => ({ default: m.BankInsuranceStep })))
const WebsiteStep = lazy(() => import('./features/brt/steps/WebsiteStep').then(m => ({ default: m.WebsiteStep })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Loading...</div>}>
        <Routes>
          {/* Login is outside Layout — no nav until authenticated */}
          <Route path="/login" element={<LoginPage />} />

          {/* All authenticated routes use Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/deck"
              element={
                <ProtectedRoute>
                  <DeckView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors"
              element={
                <ProtectedRoute>
                  <Mentors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors/:id"
              element={
                <ProtectedRoute>
                  <MentorDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors/:id/chat"
              element={
                <ProtectedRoute>
                  <MentorChatPage />
                </ProtectedRoute>
              }
            />
            {/* BRT Routes */}
            <Route
              path="/brt"
              element={
                <ProtectedRoute>
                  <BRTPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brt/name"
              element={
                <ProtectedRoute>
                  <BusinessNameStep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brt/llc"
              element={
                <ProtectedRoute>
                  <LLCFilingStep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brt/bank-insurance"
              element={
                <ProtectedRoute>
                  <BankInsuranceStep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brt/website"
              element={
                <ProtectedRoute>
                  <WebsiteStep />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function Home() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Welcome to InTrades</h2>
      <p className="text-slate-300 leading-relaxed">
        Your AI-powered companion for skilled trades mastery. Connect with
        mentor personas, track your learning journey, and build real-world
        trade skills through Socratic dialogue.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <FeatureCard
          title="The Deck"
          description="52 cards — pitfall scenarios, face card mentors, and the Business Readiness Track."
          status="active"
        />
        <FeatureCard
          title="Mentor Cards"
          description="AI trade specialists who teach through questions, not answers."
          status="coming soon"
        />
        <FeatureCard
          title="Job Agent"
          description="Your Iron Companion — guides you through day one and beyond."
          status="coming soon"
        />
        <FeatureCard
          title="Cost Estimator"
          description="Build accurate project estimates from real local pricing data."
          status="coming soon"
        />
        <FeatureCard
          title="Daily Closeout"
          description="2-minute voice ritual to capture what you learned today."
          status="coming soon"
        />
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p className="text-slate-400">Your learning dashboard will appear here.</p>
    </div>
  )
}

function Mentors() {
  return <MentorGrid />
}

function FeatureCard({ title, description, status }: {
  title: string
  description: string
  status: string
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="font-mono font-semibold text-sm">{title}</h3>
      <p className="text-slate-400 text-sm mt-2 leading-relaxed">{description}</p>
      <span className="inline-block mt-3 text-xs px-2 py-1 rounded bg-slate-800 text-slate-500">
        {status}
      </span>
    </div>
  )
}

export default App
