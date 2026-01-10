import type { BaseMessage, Message } from '.'

export function createOptimisticMessage(
  base: Omit<BaseMessage, 'type'>,
  payload: { type: 'text'; content: string } | { type: 'sticker'; stickerId: string }
): Message {
  if (payload.type === 'text') {
    return {
      ...base,
      type: 'text',
      content: payload.content
    }
  }

  return {
    ...base,
    type: 'sticker',
    stickerId: payload.stickerId
  }
}
