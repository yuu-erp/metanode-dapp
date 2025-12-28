export interface EventLogData {
  type: string
  payload: any
}
export interface IEventLogRepository {
  registerEvent(from: string, to: string): Promise<void>
  on(eventName: string, handler: (data: EventLogData) => void): () => void
}
