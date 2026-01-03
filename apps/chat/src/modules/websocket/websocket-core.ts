// ws-types.ts
export type WSState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'closed'

export interface WSOptions<T = unknown> {
  url: string
  reconnect?: {
    maxAttempts?: number // -1 = unlimited
    baseDelay?: number
    maxDelay?: number
  }
  heartbeat?: {
    interval?: number
    timeout?: number
  }
  debug?: boolean
}

// ws-core.ts
export class WebSocketCore<T = unknown> {
  private ws: WebSocket | null = null
  private state: WSState = 'idle'
  private reconnectAttempts = 0
  private heartbeatTimer?: ReturnType<typeof setInterval>
  private reconnectTimer?: ReturnType<typeof setTimeout>
  private lastPong = Date.now()

  private readonly onMessageCallbacks = new Set<(data: T) => void>()
  private readonly onStateCallbacks = new Set<(state: WSState) => void>()

  // Lưu config đã merge default thay vì mutate options gốc
  private readonly config: Required<WSOptions<T>>

  constructor(options: WSOptions<T>) {
    this.config = {
      url: options.url, // bắt buộc, không cần fallback
      reconnect: {
        maxAttempts: -1,
        baseDelay: 1000,
        maxDelay: 30000,
        ...options.reconnect
      },
      heartbeat: {
        interval: 30000,
        timeout: 60000,
        ...options.heartbeat
      },
      debug: options.debug ?? false
    }
  }

  private setState(state: WSState): void {
    if (this.state === state) return
    this.state = state
    if (this.config.debug) {
      console.log('[WS] state →', state)
    }
    this.onStateCallbacks.forEach((cb) => cb(state))
  }

  public connect(): void {
    if (['connecting', 'connected'].includes(this.state)) return
    this.setState('connecting')

    try {
      this.ws = new WebSocket(this.config.url)
    } catch (error) {
      this.setState('error')
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.lastPong = Date.now()
      this.setState('connected')
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      this.lastPong = Date.now()
      // Cố gắng parse JSON nếu có thể, nhưng vẫn cho phép raw string
      let data: T
      try {
        data = JSON.parse(event.data) as T
      } catch {
        data = event.data as T
      }
      this.onMessageCallbacks.forEach((cb) => cb(data))
    }

    this.ws.onclose = (event) => {
      this.cleanup()
      if (event.code === 1000) {
        this.setState('closed')
        return
      }
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.setState('error')
    }
  }

  public close(reason = 'Manual close'): void {
    this.ws?.close(1000, reason)
    this.cleanup()
    this.setState('closed')
  }

  public send(data: unknown): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    const payload = typeof data === 'string' ? data : JSON.stringify(data)
    this.ws.send(payload)
  }

  public onMessage(callback: (data: T) => void): () => void {
    this.onMessageCallbacks.add(callback)
    return () => this.onMessageCallbacks.delete(callback)
  }

  public onStateChange(callback: (state: WSState) => void): () => void {
    this.onStateCallbacks.add(callback)
    return () => this.onStateCallbacks.delete(callback)
  }

  private startHeartbeat(): void {
    const { interval = 30000, timeout = 60000 } = this.config.heartbeat

    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastPong > timeout) {
        this.ws?.close(1006, 'Heartbeat timeout')
        return
      }
      this.send({ type: 'ping' })
    }, interval)
  }

  private scheduleReconnect(): void {
    if (this.state === 'closed') return

    const { maxAttempts = -1, baseDelay = 1000, maxDelay = 30000 } = this.config.reconnect

    if (maxAttempts > 0 && this.reconnectAttempts >= maxAttempts) {
      this.setState('closed')
      return
    }

    this.setState('reconnecting')
    this.reconnectAttempts++

    const delay = Math.min(baseDelay * 2 ** this.reconnectAttempts, maxDelay)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  private cleanup(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws = null
  }
}
