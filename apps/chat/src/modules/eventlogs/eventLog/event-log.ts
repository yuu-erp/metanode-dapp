import { subscribeToAddress, SystemCore } from '@metanodejs/system-core'
import { type IAbiEvent } from '../decode-abi'
import type { IDecodeAbiRepository } from '../decode-abi/decode-abi.repository'
import type { EventLogData, IEventLogRepository } from './event-log.repository'
import abiData from './abi.json'
// Định nghĩa kiểu cho log sự kiện
interface EventLogPayload {
  topics: { [key: string]: string }
  data: string
}

export class EventLog implements IEventLogRepository {
  constructor(private readonly decodeAbiPort: IDecodeAbiRepository) {}

  /**
   * Đăng ký một sự kiện từ địa chỉ `from` đến `to`.
   * @param from Địa chỉ nguồn
   * @param to Địa chỉ đích
   * @throws Error nếu chưa được triển khai
   */
  async registerEvent(from: string, to: string[]): Promise<void> {
    try {
      console.log('REGISTER EVENT LOGS ---- ', to)
      if (!from || !to) throw new Error('Ban chưa đăng nhập nên chưa thể lắng nghe!')
      const abis = abiData as IAbiEvent[]
      await this.decodeAbiPort.registerAbi(abis)
      for (const toAddress of to) {
        await subscribeToAddress({ fromAddress: from, toAddress })
      }
    } catch (error) {
      console.warn(
        'Lỗi khi bắt đầu lắng nghe tin nhắn:',
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * Lắng nghe sự kiện log và giải mã dữ liệu.
   * @param callback Hàm gọi lại khi nhận được sự kiện đã giải mã
   * @returns Hàm để hủy đăng ký lắng nghe
   */
  onEventLog(callback: (data: EventLogData) => void): () => void {
    const handler = async (data: unknown) => {
      try {
        const events = Array.isArray(data) ? data : (data as { data: EventLogPayload[] }).data
        if (!Array.isArray(events)) return

        for (const result of events) {
          if (!result || !result.topics?.['0'] || !result.data) {
            console.warn('Invalid event log data:', data)
            return
          }
          const resultDecodeAbi = await this.decodeAbiPort.decodeAbi(
            result.topics['0'],
            result.data
          )
          callback({ type: resultDecodeAbi.event, payload: resultDecodeAbi.decodedData })
        }
      } catch (error) {
        console.error('Error processing event log:', (error as Error).message)
      }
    }
    // decodedData: Record<string, unknown>, event: string
    SystemCore.on('EventLogs', handler)
    return () => SystemCore.removeEventListener('EventLogs', handler)
  }
}
