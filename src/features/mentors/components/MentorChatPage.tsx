import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { mentorPersonas } from '../data/personas'
import MentorChat from './MentorChat'

// ─── MentorChatPage ───────────────────────────────────────────────
// Route: /mentors/:id/chat — direct chat view for a mentor.

export default function MentorChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const persona = mentorPersonas.find((m) => m.id === id)

  if (!persona) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-slate-400 font-mono text-sm">Mentor not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => navigate(`/mentors/${id}`)}
          aria-label="Back"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 font-mono transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {persona.nickname ?? persona.name}
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <MentorChat persona={persona} />
      </div>
    </div>
  )
}
