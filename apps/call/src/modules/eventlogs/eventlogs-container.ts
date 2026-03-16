import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import { meetFactory } from '../blockchain/meeting-contract'
import type { EventMap } from './types'

const abi: any[] = meetFactory.filter((i) => i.type === 'event')

export class EventLogsContainer {
  private readonly _decodeAbi = new DecodeAbi()
  private readonly _eventLog = new EventLog<EventMap>(this.decodeAbi)

  constructor() {}

  get eventLog(): EventLog<EventMap> {
    return this._eventLog
  }

  get decodeAbi(): DecodeAbi {
    return this._decodeAbi
  }

  public registerAbi() {
    return this._decodeAbi.registerAbi(abi)
  }
}
