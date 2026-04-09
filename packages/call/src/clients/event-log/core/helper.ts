import { EventBusOrGetter, EventBusRequest } from './types'

export function resolveEventBus(input: EventBusOrGetter): EventBusRequest {
  return typeof input === 'function' ? input() : input
}
