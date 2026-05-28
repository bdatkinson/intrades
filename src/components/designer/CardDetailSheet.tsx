import { useState, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { Card } from '../../lib/cards/types'
import { Intc } from '../../lib/cards/intc'
import { useDesignerStore } from '../../store/designerStore'

// ─── Types ─────────────────────────────────────────────────────

type Tab = 'scenario' | 'localize' | 'linked' | 'lineage'

interface CardDetailSheetProps {
  card: Card | null
  onClose: () => void
}

// ─── Download helpers ──────────────────────────────────────────

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function renderMarkdownPrompt(card: Card): string {
  return [
    `# ${card.name}`,
    '',
    `**Suit:** ${card.suit} | **Value:** ${card.value}`,
    '',
    '## Problem Statement',
    '',
    card.description,
    '',
    '## Socratic Rounds',
    '',
    '### Round 1 — Comprehension Check',
    `What does \`${card.name}\` help you accomplish on the job?`,
    '',
    '### Round 2 — Misconception',
    `What is the most common mistake when using a ${card.name.toLowerCase()}?`,
    '',
    '### Round 3 — Application',
    `Describe a situation where you would reach for a ${card.name.toLowerCase()} over an alternative.`,
    '',
    '### Round 4 — Advancement',
    'What would you teach an apprentice about this tool that took you years to learn?',
    '',
    '---',
    '',
    `Exported from InTrades Card Designer — ${new Date().toISOString().split('T')[0]}`,
  ].join('\n')
}

// ─── Confirmation Modal ────────────────────────────────────────

function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-zinc-900 border-2 border-amber-700 p-6 max-w-sm w-full mx-4 font-mono text-sm rounded-none">
        <h3 className="text-amber-400 text-xs uppercase tracking-wider mb-3">
          {title}
        </h3>
        <p className="text-zinc-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-xs uppercase tracking-wider rounded-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-1.5 border border-amber-600 bg-amber-950/40 text-amber-400 hover:bg-amber-900/40 text-xs uppercase tracking-wider rounded-none"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tabs ──────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'scenario', label: 'Scenario' },
  { key: 'localize', label: 'Localize' },
  { key: 'linked', label: 'Linked' },
  { key: 'lineage', label: 'Lineage' },
]

function TabBar({
  active,
  onChange,
}: {
  active: Tab
  onChange: (t: Tab) => void
}) {
  return (
    <div className="flex border-b-2 border-zinc-800" role="tablist">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={`
            flex-1 py-2 font-mono text-xs uppercase tracking-wider text-center
            border-b-2 -mb-0.5 transition-none rounded-none
            ${
              active === key
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Tab Panels ────────────────────────────────────────────────

function ScenarioPanel({ card }: { card: Card }) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          Part Number
        </h4>
        <p className="font-mono text-sm text-zinc-200">
          {card.suit}-{String(card.value).padStart(2, '0')}
        </p>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          Name
        </h4>
        <p className="font-mono text-sm text-zinc-200">{card.name}</p>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          Description
        </h4>
        <p className="text-sm text-zinc-300 leading-relaxed">{card.description}</p>
      </div>
    </div>
  )
}

function LocalizePanel({ card }: { card: Card }) {
  const hasSwappables = card.swappable && card.swappable.length > 0;
  return (
    <div className="p-4">
      <p className="text-sm text-zinc-500 italic">
        {hasSwappables ? `${card.swappable?.length} swappable variables available.` : "No swappable variables defined. Use the Workbench Localize Mode to flag fields for translation."}
      </p>
    </div>
  )
}

function LinkedPanel({ card }: { card: Card }) {
  const hasRuns = !!card.runId;
  const hasCrosscuts = card.crosscutIds && card.crosscutIds.length > 0;
  return (
    <div className="p-4 space-y-3">
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          Runs
        </h4>
        <p className="text-sm text-zinc-500 italic">
          {hasRuns ? `Linked to run: ${card.runId}` : "No runs linked to this card."}
        </p>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          Crosscuts
        </h4>
        <p className="text-sm text-zinc-500 italic">
          {hasCrosscuts ? `Linked to crosscuts: ${card.crosscutIds?.join(', ')}` : "No crosscuts linked to this card."}
        </p>
      </div>
    </div>
  )
}

function LineagePanel({ card }: { card: Card }) {
  return (
    <div className="p-4 space-y-3">
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          ID
        </h4>
        <p className="font-mono text-xs text-zinc-400">{card.id}</p>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          Suit
        </h4>
        <p className="font-mono text-xs text-zinc-400">{card.suit}</p>
      </div>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
          Value
        </h4>
        <p className="font-mono text-xs text-zinc-400">{card.value}</p>
      </div>
    </div>
  )
}

// ─── Footer ────────────────────────────────────────────────────

function SheetFooter({ card }: { card: Card }) {
  const duplicateCard = useDesignerStore((s) => s.duplicateCard)
  const resetCard = useDesignerStore((s) => s.resetCard)
  const cards = useDesignerStore((s) => s.cards)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleShareIntc = useCallback(() => {
    const allCards = useDesignerStore.getState().cards
    const json = Intc.export(allCards, 'InTrades Designer', 'Card Deck')
    const filename = `${slugify(card.name)}.intc`
    downloadFile(filename, json, 'application/json')
  }, [card])

  const handleShareMd = useCallback(() => {
    const md = renderMarkdownPrompt(card)
    const partNum = `${card.suit}-${String(card.value).padStart(2, '0')}`
    const filename = `${partNum}-${slugify(card.name)}.md`
    downloadFile(filename, md, 'text/markdown')
  }, [card])

  const handleDuplicate = useCallback(() => {
    // Check for empty slot
    const suitCards = cards.filter(c => c.suit === card.suit)
    const usedValues = new Set(suitCards.map(c => c.value))
    let hasEmpty = false
    for (let v = 1; v <= 13; v++) {
      if (!usedValues.has(v)) {
        hasEmpty = true
        break
      }
    }

    if (!hasEmpty) {
      alert('No empty slots available in this suit. Remove a card first.')
      return
    }

    duplicateCard(card)
  }, [card, cards, duplicateCard])

  const handleResetConfirm = useCallback(() => {
    resetCard(card.id)
    setShowResetConfirm(false)
  }, [card.id, resetCard])

  return (
    <>
      <div className="border-t-2 border-zinc-800 p-3 space-y-2">
        <button
          type="button"
          onClick={handleShareIntc}
          className="w-full py-2 font-mono text-xs text-left px-3 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-none rounded-none"
        >
          Share for Remix (.intc)
        </button>
        <button
          type="button"
          onClick={handleShareMd}
          className="w-full py-2 font-mono text-xs text-left px-3 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-none rounded-none"
        >
          Share as Prompt (.md)
        </button>
        <button
          type="button"
          onClick={handleDuplicate}
          className="w-full py-2 font-mono text-xs text-left px-3 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-none rounded-none"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-2 font-mono text-xs text-left px-3 border border-red-900/60 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-none rounded-none"
        >
          Reset to Default
        </button>
      </div>

      <ConfirmModal
        open={showResetConfirm}
        title="Reset Card"
        message={`Are you sure you want to reset "${card.name}" to its default state? This cannot be undone (beyond undo).`}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  )
}

// ─── CardDetailSheet ───────────────────────────────────────────

export function CardDetailSheet({ card, onClose }: CardDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>('scenario')

  if (!card) return null

  return (
    <Dialog.Root open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />

        {/* Sheet */}
        <Dialog.Content
          className={`
            fixed right-0 top-0 bottom-0 z-50
            w-full max-w-[480px]
            bg-zinc-950 border-l-2 border-zinc-700
            flex flex-col
            font-mono
            outline-none
            rounded-none
          `}
        >
          {/* Header with close button + suit/value badge */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500 tabular-nums">
                {card.suit}-{String(card.value).padStart(2, '0')}
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                {card.suit}
              </span>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-none"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <TabBar active={activeTab} onChange={setActiveTab} />

          {/* Tab Content — scrollable */}
          <div className="flex-1 overflow-y-auto" role="tabpanel" aria-label={activeTab}>
            {activeTab === 'scenario' && <ScenarioPanel card={card} />}
            {activeTab === 'localize' && <LocalizePanel card={card} />}
            {activeTab === 'linked' && <LinkedPanel card={card} />}
            {activeTab === 'lineage' && <LineagePanel card={card} />}
          </div>

          {/* Footer Actions */}
          <SheetFooter card={card} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
