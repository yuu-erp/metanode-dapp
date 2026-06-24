import { createUseEventBus, createWaitEvent, EventBusRequest } from './core'
import { FrontendEventType } from '~/@types'

export type EventLogData = {
  JoinRequestPending: {
    roomId: string
    participant: string
    owner: string
  }

  RaiseHandUpdated: {
    roomId: string
    user: string
    isRaised: boolean
    timestamp: number
    owner: string
  }

  CallReactionSent: {
    roomId: string
    sender: string
    reaction: string
    owner: string
  }

  LeaveRequested: {
    roomId: string
    requester: string
    sessionId: string
  }

  CallRejected: {
    caller: string
    callee: string
    roomId: string
  }

  CallReceived: {
    caller: string
    callee: string
    roomId: string
    status: string
    owner: string
  }

  CallReceivedSignal: {
    caller: string
    callee: string
    roomId: string
    status: string
    owner: string
  }

  ScreenShareStopped: {
    roomId: string
    sharer: string
  }

  ScreenShareStarted: {
    roomId: string
    sharer: string
  }

  FrontendEvent: {
    roomId: string
    toUser: string
    eventType: FrontendEventType
    data: string
  }

  RoomCreateRequested: {
    requestId: string
    requester: string
    roomName: string
    meet: string
    roomId: string
  }
}

let eventLog: EventBusRequest | null = null

export function setEventLog(_eventLog: EventBusRequest) {
  eventLog = _eventLog
}

export function getEventLog() {
  if (!eventLog) throw new Error('eventLog is not set')
  return {
    on: eventLog.on.bind(eventLog),
    off: eventLog.off.bind(eventLog)
  }
}

export const waitEventLog = createWaitEvent<EventLogData>(getEventLog, 15_000)
export const useEventLog = createUseEventBus<EventLogData>(getEventLog)
