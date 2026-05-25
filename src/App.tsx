import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <header className="border-b border-slate-800 px-6 py-4">
          <h1 className="text-xl font-semibold font-mono tracking-tight">
            InTrades
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Skilled Trades Mentoring Platform
          </p>
        </header>

        <main className="px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
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
