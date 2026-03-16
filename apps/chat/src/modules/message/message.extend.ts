import type { AppEvents } from '@/types/app-events'
import type { EventBusPort } from '../event'

export class MessageExtend {
  constructor(private readonly eventBus: EventBusPort<AppEvents>) {
    this.subscribe()
  }

  handler = (e: AppEvents['message.send.bua']) => {
    this.eventBus.emit('message.add', e)
  }

  subscribe() {
    this.eventBus.on('message.send.bua', this.handler)
  }

  unsubscribe() {
    this.eventBus.off('message.send.bua', this.handler)
  }
}
