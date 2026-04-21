import type {
  CloudflareConfig,
  WebRTCConfig,
  CloudflareAdapter,
  WebRTCAdapter
} from './realtime-transport.type'
import { CloudflareAdapterImpl } from './adapters/cloudflare.adapter'
import { WebRTCAdapterImpl } from './adapters/webrtc.adapter'
import { TransportService } from './services/transport.service'
import { SessionManager } from './services/session-manager.service'

/**
 * RealtimeTransportFactory
 *
 * Singleton DI container cho toàn bộ realtime-transport module
 *
 * Giải quyết dependencies và cung cấp facade interface
 * cho các lớp khác trong ứng dụng.
 *
 * Usage:
 * ```ts
 * const factory = RealtimeTransportFactory.getInstance({
 *   cloudflareConfig: { ... },
 *   webrtcConfig: { ... }
 * })
 *
 * const session = await factory.sessionManager.createSession(...)
 * ```
 */
export class RealtimeTransportFactory {
  private static instance: RealtimeTransportFactory

  // Services
  public transportService: TransportService
  public sessionManager: SessionManager

  // Adapters
  public cloudflareAdapter: CloudflareAdapter
  public webrtcAdapter: WebRTCAdapter

  // Config
  private cloudflareConfig: CloudflareConfig
  private webrtcConfig: WebRTCConfig

  private constructor(
    cloudflareConfig: CloudflareConfig,
    webrtcConfig: WebRTCConfig,
    cloudflareAdapter?: CloudflareAdapter,
    webrtcAdapter?: WebRTCAdapter
  ) {
    this.cloudflareConfig = cloudflareConfig
    this.webrtcConfig = webrtcConfig

    // Initialize adapters (mặc định hoặc custom)
    this.cloudflareAdapter = cloudflareAdapter || new CloudflareAdapterImpl()
    this.webrtcAdapter = webrtcAdapter || new WebRTCAdapterImpl()

    // Initialize services
    this.transportService = new TransportService(
      this.cloudflareAdapter,
      this.webrtcAdapter,
      this.cloudflareConfig,
      this.webrtcConfig
    )

    this.sessionManager = new SessionManager(this.transportService)
  }

  /**
   * Khởi tạo factory (singleton)
   */
  static getInstance(options: {
    cloudflareConfig: CloudflareConfig
    webrtcConfig: WebRTCConfig
    cloudflareAdapter?: CloudflareAdapter
    webrtcAdapter?: WebRTCAdapter
  }): RealtimeTransportFactory {
    if (!RealtimeTransportFactory.instance) {
      RealtimeTransportFactory.instance = new RealtimeTransportFactory(
        options.cloudflareConfig,
        options.webrtcConfig,
        options.cloudflareAdapter,
        options.webrtcAdapter
      )
    }

    return RealtimeTransportFactory.instance
  }

  /**
   * Reset instance (chủ yếu dùng cho testing)
   */
  static resetInstance(): void {
    if (RealtimeTransportFactory.instance) {
      RealtimeTransportFactory.instance.sessionManager.closeAllSessions().catch(console.error)
    }
    RealtimeTransportFactory.instance = null as any
  }

  /**
   * Cleanup khi đóng ứng dụng
   */
  async destroy(): Promise<void> {
    await this.sessionManager.closeAllSessions()
  }

  /**
   * Update configuration (nếu cần)
   */
  updateConfig(options: {
    cloudflareConfig?: CloudflareConfig
    webrtcConfig?: WebRTCConfig
  }): void {
    if (options.cloudflareConfig) {
      this.cloudflareConfig = options.cloudflareConfig
    }
    if (options.webrtcConfig) {
      this.webrtcConfig = options.webrtcConfig
    }
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      cloudflareConfig: this.cloudflareConfig,
      webrtcConfig: this.webrtcConfig
    }
  }
}

/**
 * Export singleton instance getter
 */
export function getRealtimeTransportFactory(): RealtimeTransportFactory {
  const instance = RealtimeTransportFactory.getInstance({
    cloudflareConfig: {
      appID: import.meta.env.VITE_CLOUDFLARE_APP_ID || '',
      appToken: import.meta.env.VITE_CLOUDFLARE_APP_TOKEN || '',
      apiBase: import.meta.env.VITE_CLOUDFLARE_API_BASE || 'https://api.cloudflare.com'
    },
    webrtcConfig: {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] }
      ]
    }
  })

  return instance
}
