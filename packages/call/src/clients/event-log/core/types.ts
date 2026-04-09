export type EventBusCallback = (e: any) => void

export type EventBusRequest = {
  on: (name: string, cb: EventBusCallback) => void
  off: (name: string, cb: EventBusCallback) => void
}

export type EventBusOrGetter = EventBusRequest | (() => EventBusRequest)
