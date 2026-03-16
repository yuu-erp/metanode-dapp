import mitt from 'mitt'
import type { AppEvent } from './types'
import { useCall } from './store'

class CallContainer {
  eventBus = mitt<AppEvent>()
  store = useCall
}

export const callContainer = new CallContainer()
