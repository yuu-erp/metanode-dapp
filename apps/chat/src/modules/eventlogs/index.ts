import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import { userContract } from '../blockchain/user-contract/abis'
import { groupContract } from '../blockchain/group-contract/abis'
import { anonymousGroupContract } from '../blockchain/anonymous-group-contract/abis'
import { factoryContract } from '../blockchain/factory-contract/abis'
import { meetingContract } from '../blockchain/meeting-contract'
import type { EventMap } from './event-logs.types'

const abi: any[] = [
  ...userContract,
  ...groupContract,
  ...anonymousGroupContract,
  ...meetingContract,
  ...factoryContract
].filter((item) => item?.type === 'event')

export class EventLogContainer {
  private readonly _decodeAbi: DecodeAbi
  private readonly _eventLog: EventLog<EventMap>
  constructor() {
    console.log('KHỞI TẠO EVENT LOG CONTAINER', abi)
    this._decodeAbi = new DecodeAbi()
    this._eventLog = new EventLog<EventMap>(this._decodeAbi)
  }

  get eventLog(): EventLog<EventMap> {
    return this._eventLog
  }

  get decodeAbi(): DecodeAbi {
    return this._decodeAbi
  }

  public async registerAbi() {
    try {
      const rs = await this._decodeAbi?.registerAbi?.(abi)

      return rs
    } catch (error) {}
  }
}

export * from './event-logs.types'
