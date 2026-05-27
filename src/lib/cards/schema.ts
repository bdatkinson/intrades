import { z } from 'zod'
import { SUITS } from './types'

export const SuitSchema = z.enum(SUITS)

export const CardSchema = z.object({
  id: z.string(),
  suit: SuitSchema,
  value: z.number().int().min(1).max(13),
  name: z.string(),
  description: z.string(),
})

export const IntcFileSchema = z.object({
  version: z.literal(1),
  cards: z.array(CardSchema),
  meta: z.object({
    name: z.string().optional(),
    author: z.string().optional(),
    created: z.string().optional(),
  }).optional(),
})

export type IntcFile = z.infer<typeof IntcFileSchema>
