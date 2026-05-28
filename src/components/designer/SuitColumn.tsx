import { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDesignerStore } from '../../store/designerStore'
import { SUIT_META } from '../../lib/cards/types'
import type { Suit, Card } from '../../lib/cards/types'

// ─── Sortable Slot ───────────────────────────────────────────────

function SortableSlot({ value, card, onClick, suit }: { value: number; card: Card | null; onClick?: (card: Card) => void; suit: Suit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `slot-${value}`, disabled: !card })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-disabled={!card}
      aria-label={card ? `${suit} ${value}: ${card.name}` : `${suit} ${value}: empty slot`}
      aria-roledescription="sortable card slot"
      data-slot-value={value}
      onClick={() => { if (card && onClick) onClick(card) }}
      className={`
        w-full h-12 flex items-center gap-2 px-3 border-2 border-dashed rounded-none
        font-mono text-sm text-left transition-none
        ${isDragging
          ? 'border-amber-500 bg-amber-950/20 text-zinc-200 cursor-grabbing'
          : card
            ? 'border-zinc-700 bg-zinc-900 text-zinc-200 cursor-grab active:cursor-grabbing'
            : 'border-zinc-800 bg-transparent text-zinc-600 cursor-default'
        }
      `}
    >
      <span className="w-6 text-zinc-500 text-xs text-right tabular-nums shrink-0">
        {value}
      </span>
      {card ? (
        <span className="truncate">{card.name}</span>
      ) : (
        <span className="italic text-zinc-600 text-xs">empty</span>
      )}
    </button>
  )
}

// ─── Ghost Slot ──────────────────────────────────────────────────

function GhostSlot({ card }: { card: Card }) {
  return (
    <div
      className="w-full h-12 flex items-center gap-2 px-3 border-2 border-dashed border-zinc-600 rounded-none font-mono text-sm text-left"
      style={{ opacity: 0.45 }}
    >
      <span className="w-6 text-zinc-500 text-xs text-right tabular-nums shrink-0">
        {card.value}
      </span>
      <span className="truncate text-zinc-300">{card.name}</span>
    </div>
  )
}

// ─── SuitColumn ──────────────────────────────────────────────────

interface SuitColumnProps {
  suit: Suit
  onCardClick?: (card: Card) => void
}

export function SuitColumn({ suit, onCardClick }: SuitColumnProps) {
  const cards = useDesignerStore((s) => s.cards)
  const dragPreview = useDesignerStore((s) => s.dragPreview)
  const setDragPreview = useDesignerStore((s) => s.setDragPreview)
  const clearDragPreview = useDesignerStore((s) => s.clearDragPreview)
  const commitMove = useDesignerStore((s) => s.commitMove)

  const suitCards = useMemo(
    () => cards.filter((c) => c.suit === suit).sort((a, b) => a.value - b.value),
    [cards, suit],
  )

  // Build a map: value → Card | null for all 13 slots
  const slotMap = useMemo(() => {
    const map = new Map<number, Card | null>()
    for (let v = 1; v <= 13; v++) {
      map.set(v, suitCards.find((c) => c.value === v) ?? null)
    }
    return map
  }, [suitCards])

  // Ghost cards: if dragPreview is for this suit, use previewCards
  const ghostMap = useMemo(() => {
    if (!dragPreview || dragPreview.suit !== suit) return null
    const map = new Map<number, Card | null>()
    for (let v = 1; v <= 13; v++) {
      map.set(v, dragPreview.previewCards.find((c) => c.value === v) ?? null)
    }
    return map
  }, [dragPreview, suit])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const value = parseInt(String(active.id).replace('slot-', ''), 10)
    const card = slotMap.get(value)
    if (card) {
      setDragPreview(suit, card, value, value)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const fromValue = parseInt(String(active.id).replace('slot-', ''), 10)
    const toValue = parseInt(String(over.id).replace('slot-', ''), 10)
    const card = slotMap.get(fromValue)
    if (card && fromValue !== toValue) {
      setDragPreview(suit, card, fromValue, toValue)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      clearDragPreview()
      return
    }
    const fromValue = parseInt(String(active.id).replace('slot-', ''), 10)
    const toValue = parseInt(String(over.id).replace('slot-', ''), 10)
    if (fromValue !== toValue) {
      commitMove(suit, fromValue, toValue)
    } else {
      clearDragPreview()
    }
  }

  const handleDragCancel = () => {
    clearDragPreview()
  }

  const meta = SUIT_META[suit]
  const sortableIds = Array.from({ length: 13 }, (_, i) => `slot-${i + 1}`)

  return (
    <div className="flex flex-col gap-1 min-w-[200px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-1">
        <span className="text-lg">{meta.symbol}</span>
        <h2 className="font-mono font-semibold text-sm text-zinc-300 uppercase tracking-widest">
          {meta.label}
        </h2>
      </div>

      {/* Slots */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: 13 }, (_, i) => {
              const value = i + 1
              const card = slotMap.get(value) ?? null

              // If ghost preview is active, render ghost cards instead of real ones
              if (ghostMap) {
                const ghostCard = ghostMap.get(value) ?? null
                return ghostCard ? (
                  <GhostSlot key={value} card={ghostCard} />
                ) : (
                  <div
                    key={value}
                    className="w-full h-12 border-2 border-dashed border-zinc-800/40 rounded-none"
                  />
                )
              }

              return <SortableSlot key={value} value={value} card={card} suit={suit} onClick={onCardClick} />
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
