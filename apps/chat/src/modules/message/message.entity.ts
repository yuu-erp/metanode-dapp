import type { BaseMessage, Message } from '.'

export function createOptimisticMessage(
  base: Omit<BaseMessage, 'type'>,
  payload:
    | { type: 'text'; content: string; replyTo?: Message['replyTo'] }
    | { type: 'sticker'; stickerId: string; replyTo?: Message['replyTo'] }
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
