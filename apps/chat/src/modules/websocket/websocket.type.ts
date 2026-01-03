export type WebsocketState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'closed'
  | 'error'

export interface WebsocketOptions {
  url: string
  reconnect: {
    maxAttempts: number
    baseDelay: number
    maxDelay: number
  }
  heartbeat: {
    interval: number
    timeout: number
  }
  debug?: boolean
}
