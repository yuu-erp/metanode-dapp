import type { Emitter } from 'mitt'

export type RtcAnswerReceived = {
  sdp: string
  sessionId: string
}

export type AppEvent = {
  'rtc:answer:received': RtcAnswerReceived
}

export type EventBus = Emitter<AppEvent>
