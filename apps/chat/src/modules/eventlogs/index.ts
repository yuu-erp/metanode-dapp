import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import abi from './abi.json'

export type EventMap = {
  MessageReceived: {
    sender: string
    encryptedContent: string
  }
}
export class EventLogContainer {
  private readonly _decodeAbi: DecodeAbi
  private readonly _eventLog: EventLog<EventMap>
  constructor() {
    console.log('KHỞI TẠO EVENT LOG CONTAINER')
    this._decodeAbi = new DecodeAbi()
    this._decodeAbi.registerAbi(abi)
    this._eventLog = new EventLog<EventMap>(this._decodeAbi)
  }

  get eventLog(): EventLog<EventMap> {
    return this._eventLog
  }

  get decodeAbi(): DecodeAbi {
    return this._decodeAbi
  }
}
