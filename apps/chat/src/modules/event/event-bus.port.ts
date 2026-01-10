export interface EventBusPort<TEvents extends Record<string, any>> {
  on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): void

  once?<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): void

  off<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): void

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void

  clear?(): void
}
