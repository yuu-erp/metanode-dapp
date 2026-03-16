import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import { meetFactory } from './blockchain/meeting-contract'

const abi: any[] = meetFactory.filter((i) => i.type === 'event')

export type EventLogMap = {
  RoomCreateRequested: {
    requestId: string
    requester: string
    roomName: string
    meet: string
    roomId: string
  }

  FrontendEvent: {
    roomId: string
    toUser: string
    eventType: string
    data: string
  }

  LeaveRequested: {
    roomId: string
    requester: string
    sessionId: string
  }
}

export class EventLogsContainer {
  private readonly _decodeAbi = new DecodeAbi()
  private readonly _eventLog = new EventLog<EventLogMap>(this.decodeAbi)

  constructor() {}

  get eventLog(): EventLog<EventLogMap> {
    return this._eventLog
  }

  get decodeAbi(): DecodeAbi {
    return this._decodeAbi
  }

  public registerAbi() {
    return this._decodeAbi.registerAbi(abi)
  }
}
export const eventLog = new EventLogsContainer()
