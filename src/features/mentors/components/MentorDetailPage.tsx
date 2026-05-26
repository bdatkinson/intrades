import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { mentorPersonas } from '../data/personas'
import MentorDetailComponent from './MentorDetail'

// ─── MentorDetailPage ─────────────────────────────────────────────
// Route: /mentors/:id — resolves mentor persona from URL and renders
// the detail view with resume/new-session options.

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const persona = mentorPersonas.find((m) => m.id === id)

  if (!persona) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-slate-400 font-mono text-sm">Mentor not found</p>
        <button
          type="button"
          onClick={() => navigate('/mentors')}
          className="mt-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 font-mono transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </button>
      </div>
    )
  }

  return <MentorDetailComponent persona={persona} />
}
