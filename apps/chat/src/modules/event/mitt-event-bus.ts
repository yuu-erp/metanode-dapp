import mitt, { type Emitter } from 'mitt'
import type { EventBusPort } from './event-bus.port'

export class MittEventBus<TEvents extends Record<string, any>> implements EventBusPort<TEvents> {
  private emitter: Emitter<TEvents>

  constructor() {
    this.emitter = mitt<TEvents>()
  }

  on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void) {
    this.emitter.on(event, handler)
  }

  once<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void) {
    const wrapper = (payload: TEvents[K]) => {
      handler(payload)
      this.off(event, wrapper)
    }

    this.on(event, wrapper)
  }

  off<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void) {
    this.emitter.off(event, handler)
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]) {
    this.emitter.emit(event, payload)
  }

  clear() {
    this.emitter.all.clear()
  }
}
