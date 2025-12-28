import { subscribeToAddress, SystemCore } from '@metanodejs/system-core'
import type { IDecodeAbiRepository } from './decode-abi.repository'
import type { EventLogData, IEventLogRepository } from './event-log.repository'

interface EventLogPayload {
  topics: { [key: string]: string }
  data: string
}

type EventHandler = (payload: EventLogData) => void

export class EventLog implements IEventLogRepository {
  private handlers: Record<string, EventHandler[]> = {}
  private pendingEvents: EventLogData[] = []
  private timer?: NodeJS.Timeout

  constructor(private readonly decodeAbiPort: IDecodeAbiRepository) {
    this.initGlobalListener()
  }

  /** Đăng ký lắng nghe 1 địa chỉ */
  async registerEvent(from: string, to: string): Promise<void> {
    if (!from || !to) throw new Error('Chưa đăng nhập, không thể lắng nghe event!')
    await subscribeToAddress({ fromAddress: from, toAddress: to })
  }

  /** Đăng ký handler cho event riêng */
  on(eventName: string, handler: EventHandler): () => void {
    if (!this.handlers[eventName]) this.handlers[eventName] = []
    this.handlers[eventName].push(handler)

    // Return function để hủy đăng ký
    return () => {
      this.handlers[eventName] = this.handlers[eventName].filter((h) => h !== handler)
    }
  }

  /** Global listener decode log và batch dispatch */
  private initGlobalListener() {
    SystemCore.on('EventLogs', async (data: unknown) => {
      try {
        const logs: EventLogPayload[] = Array.isArray(data)
          ? (data as EventLogPayload[])
          : (data as { data: EventLogPayload[] }).data || []

        for (const logData of logs) {
          if (!logData?.topics?.['0'] || !logData.data) continue

          const decoded = await this.decodeAbiPort.decodeAbi(logData.topics['0'], logData.data)

          this.queueEvent({ type: decoded.event, payload: decoded.decodedData })
        }
      } catch (err) {
        console.error('EventLog processing error:', (err as Error).message)
      }
    })
  }

  /** Gom event trước khi dispatch */
  private queueEvent(event: EventLogData) {
    this.pendingEvents.push(event)

    if (!this.timer) {
      this.timer = setTimeout(() => {
        const batch = [...this.pendingEvents]
        this.pendingEvents = []
        this.timer = undefined

        // Dispatch đến handler tương ứng
        batch.forEach((e) => {
          this.handlers[e.type]?.forEach((h) => h(e))
        })
      }, 50) // debounce 50ms
    }
  }
}
