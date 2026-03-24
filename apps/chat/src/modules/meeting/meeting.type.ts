import type { ConversationType } from '../conversation'

export type MeetingData = {
  caller: string
  callee: string
  roomId: string
  address: string
  sessionId: string
  type: 'direct' | 'meet'
}

export type MeetingViewInput = {
  caller: string
  callee: string
  isMeet: boolean
  isCaller: boolean
  address: string
  roomId?: string
  hiddenAddress: string
  conversationType: ConversationType
}
