import { Blockchain } from './blockchain'
import { CallService } from './call'
import { EventLogsContainer } from './eventlogs/eventlogs-container'

export class CallContainer {
  readonly blockchain = new Blockchain()
  readonly eventLogContainer = new EventLogsContainer()
  readonly callService = new CallService(this.blockchain, this.eventLogContainer)
}

export const container = new CallContainer()
