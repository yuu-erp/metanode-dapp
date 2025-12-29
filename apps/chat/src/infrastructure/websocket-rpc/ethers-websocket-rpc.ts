import { ethers } from 'ethers'

type ReconnectOptions = {
  maxAttempts?: number // Số lần thử tối đa (-1 = vô hạn)
  reconnectDelay?: number // ms - delay giữa các lần thử
  reconnectDelayMax?: number // ms - delay tối đa (exponential backoff)
  keepAliveInterval?: number // ms - gửi ping định kỳ để giữ kết nối
  keepAliveTimeout?: number // ms - nếu không nhận pong trong khoảng này -> coi như chết
  debug?: boolean
}

const DEFAULT_OPTIONS: Required<ReconnectOptions> = {
  maxAttempts: -1, // -1 = unlimited
  reconnectDelay: 1000,
  reconnectDelayMax: 30000,
  keepAliveInterval: 15000,
  keepAliveTimeout: 30000,
  debug: false
}

/**
 * WebSocket Provider có khả năng tự động reconnect
 * Hỗ trợ keep-alive bằng ping/pong
 */
export class ReconnectingWebSocketProvider extends ethers.WebSocketProvider {
  private wsUrl: string
  private options: Required<ReconnectOptions>

  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private keepAliveTimer: NodeJS.Timeout | null = null
  private lastPongTime: number = Date.now()

  private _destroyed = false

  constructor(url: string, options: Partial<ReconnectOptions> = {}) {
    super(url)

    this.wsUrl = url
    this.options = { ...DEFAULT_OPTIONS, ...options }

    this.log('Khởi tạo ReconnectingWebSocketProvider')

    this.setupEventListeners()
    this.startKeepAlive()
  }

  private log(...args: any[]) {
    if (this.options.debug) {
      console.log('[WS-Reconnect]', ...args)
    }
  }

  private setupEventListeners() {
    // Lắng nghe sự kiện close từ WebSocket nội bộ
    ;(this as any)._websocket?.addEventListener('close', this.handleClose.bind(this))
    ;(this as any)._websocket?.addEventListener('error', this.handleError.bind(this))

    // Một số provider phát sự kiện error/close qua provider
    this.on('error', (err) => {
      this.log('Provider error:', err)
      this.scheduleReconnect()
    })
  }

  private handleClose(event: CloseEvent) {
    this.log(`WebSocket closed - code: ${event.code}, reason: ${event.reason}`)

    if (this._destroyed) return

    this.scheduleReconnect()
  }

  private handleError(error: any) {
    this.log('WebSocket error:', error)
    this.scheduleReconnect()
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)

    if (this._destroyed) return

    // Kiểm tra giới hạn thử lại
    if (this.options.maxAttempts > 0 && this.reconnectAttempts >= this.options.maxAttempts) {
      console.error('[WS-Reconnect] Đã đạt giới hạn số lần reconnect!')
      return
    }

    // Exponential backoff
    let delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.options.reconnectDelayMax
    )

    this.reconnectAttempts++
    this.log(`Sẽ thử reconnect lần ${this.reconnectAttempts} sau ${delay}ms...`)

    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnect()
    }, delay)
  }

  private async attemptReconnect() {
    try {
      this.log('Đang thử kết nối lại...')

      // Tạo provider mới
      const newProvider = new ethers.WebSocketProvider(this.wsUrl)

      // Copy các listener sang provider mới (cách đơn giản nhất)
      // Lưu ý: cách tốt hơn là bạn nên lưu danh sách listeners và resubscribe
      // Nhưng cách này chỉ phù hợp khi bạn chủ yếu dùng on("block"), on("pending")...
      ;(this as any)._websocket = (newProvider as any)._websocket

      // Cập nhật lại event listeners
      this.setupEventListeners()

      this.reconnectAttempts = 0
      this.lastPongTime = Date.now()

      this.log('→ Kết nối lại thành công!')
      this.startKeepAlive()
    } catch (err) {
      this.log('Reconnect thất bại:', err)
      this.scheduleReconnect()
    }
  }

  // ================= Keep Alive =================
  private startKeepAlive() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)

    this.keepAliveTimer = setInterval(() => {
      const now = Date.now()

      // Kiểm tra đã quá lâu chưa nhận pong
      if (now - this.lastPongTime > this.options.keepAliveTimeout) {
        this.log('Không nhận được pong trong thời gian chờ → coi như mất kết nối')
        this.handleClose({ code: 4000, reason: 'keep-alive timeout' } as any)
        return
      }

      // Gửi ping
      try {
        ;(this as any)._websocket?.ping?.()
        this.log('→ Ping...')
      } catch (e) {
        // ignore
      }
    }, this.options.keepAliveInterval)
  }

  // Gọi khi bạn nhận được pong (nếu provider hỗ trợ)
  // Một số provider không phát pong event, bạn có thể override
  public pongReceived() {
    this.lastPongTime = Date.now()
    this.log('← Pong')
  }

  public async destroy(): Promise<void> {
    this._destroyed = true

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)

    try {
      // ethers v6 dùng close() async
      await (this as any)._websocket?.close?.(1000, 'Client shutdown')
    } catch {
      // ignore close error
    }

    this.log('Provider đã bị hủy')
  }
}

// ---------------------- Ví dụ sử dụng ----------------------

/*
const provider = new ReconnectingWebSocketProvider(
  "wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
  {
    debug: true,
    reconnectDelay: 1000,
    reconnectDelayMax: 30000,
    keepAliveInterval: 12000,
    keepAliveTimeout: 45000,
  }
);

provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

provider.on("error", (err) => {
  console.error("Provider error:", err);
});

// Khi muốn hủy
// provider.destroy();
*/
