import { useEffect } from 'react'
import { useDesignerStore } from '../../store/designerStore'
import { SuitColumn } from '../../components/designer/SuitColumn'
import { SUITS } from '../../lib/cards/types'
import type { Suit } from '../../lib/cards/types'

/**
 * Workbench — the instructor designer surface.
 *
 * Layout: 4 vertical suit columns over a bottom-right floating dock.
 * Keybindings: Cmd/Ctrl-Z (undo), Cmd/Ctrl-Shift-Z (redo).
 * Design: OSHA placard / machine-label — no shadows, no gradients, hard corners.
 */
export function Workbench() {
  const undo = useDesignerStore((s) => s.undo)
  const redo = useDesignerStore((s) => s.redo)
  const undoDepth = useDesignerStore((s) => s.undoStack.length)
  const redoDepth = useDesignerStore((s) => s.redoStack.length)

  // ─── Global keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod || e.key !== 'z') return

      // Prevent browser undo/redo
      e.preventDefault()

      if (e.shiftKey) {
        redo()
      } else {
        undo()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-800">
        <h1 className="font-mono font-semibold text-sm uppercase tracking-widest text-slate-400">
          Designer
        </h1>
        <span className="font-mono text-xs text-slate-600">
          {undoDepth > 0 && `${undoDepth} action${undoDepth !== 1 ? 's' : ''} in undo`}
          {redoDepth > 0 && ` · ${redoDepth} in redo`}
        </span>
      </header>

      {/* ─── Suit Columns ───────────────────────────────────── */}
      <main className="p-4">
        <div className="grid grid-cols-4 gap-4 max-w-[960px] mx-auto">
          {SUITS.map((suit: Suit) => (
            <SuitColumn key={suit} suit={suit} />
          ))}
        </div>
      </main>

      {/* ─── Dock ────────────────────────────────────────────── */}
      <div
        data-testid="designer-dock"
        className="fixed bottom-4 right-4 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={undo}
          disabled={undoDepth === 0}
          aria-label={`Undo${undoDepth > 0 ? ` (${undoDepth})` : ''}`}
          className={`
            font-mono text-xs uppercase tracking-wider px-3 py-2
            border-2 rounded-none transition-none
            ${
              undoDepth > 0
                ? 'border-amber-600 bg-amber-950/40 text-amber-400 hover:bg-amber-900/40 cursor-pointer'
                : 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          Undo{undoDepth > 0 ? ` (${undoDepth})` : ''}
        </button>
      </div>
    </div>
  )
}
