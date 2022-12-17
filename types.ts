import { z } from 'npm:zod'



export const ChatFeat = z.union([
    z.literal('nolink'),
    z.literal('nomap'),
])



export const Storage = z.object({
    subs: z.object({
        id: z.string(),
        features: ChatFeat.array()
    }).array()
})