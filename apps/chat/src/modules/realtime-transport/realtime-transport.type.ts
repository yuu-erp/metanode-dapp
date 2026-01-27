/**
 * Cấu hình kết nối Cloudflare WebRTC
 * @see https://developers.cloudflare.com/calls/get-started/
 */
export interface CloudflareConfig {
  /** Cloudflare App ID */
  appID: string
  /** Cloudflare API Token */
  appToken: string
  /** Cloudflare API base URL */
  apiBase: string
  /** Custom HTTP headers (e.g., authorization) */
  headers?: Record<string, string>
}

/**
 * Cấu hình WebRTC peer connection
 */
export interface WebRTCConfig {
  /** ICE servers để discover NAT */
  iceServers: RTCIceServer[]
  /** Chính sách gộp media/data channels */
  bundlePolicy?: RTCBundlePolicy
}

/**
 * Session context từ Cloudflare API
 * Chứa thông tin về relay session hiện tại
 */
export interface CloudflareSession {
  sessionId: string
  sessionDescription: RTCSessionDescriptionInit
}

/**
 * Track info từ Cloudflare
 * Mỗi track có trackName, mid (media id), và sessionId (nếu pull)
 */
export interface CloudflareTrack {
  trackName: string
  mid: string
  sessionId?: string
}

/**
 * Data channel info từ Cloudflare
 */
export interface CloudflareDataChannel {
  id: string
}

/**
 * Adapter interface để interact với Cloudflare WebRTC API
 * @see modules/realtime-transport/adapters/cloudflare.adapter.ts
 */
export interface CloudflareAdapter {
  /**
   * Tạo relay session trên Cloudflare
   * @param config - Cloudflare configuration
   * @param localDescription - Local SDP description
   */
  createSession(
    config: CloudflareConfig,
    localDescription: RTCSessionDescriptionInit
  ): Promise<CloudflareSession>

  /**
   * Tạo data channel send
   */
  createSendChannel(
    config: CloudflareConfig,
    sessionId: string,
    dataChannelName: string
  ): Promise<{ dataChannels: CloudflareDataChannel[] }>

  /**
   * Tạo data channel receive
   */
  createReceiveChannel(
    config: CloudflareConfig,
    sessionId: string,
    dataChannelName: string,
    senderSessionId: string
  ): Promise<{ dataChannels: CloudflareDataChannel[] }>

  /**
   * Đóng relay session
   */
  closeSession(config: CloudflareConfig, sessionId: string): Promise<void>

  /**
   * Push local track đến Cloudflare relay
   */
  pushTrack(
    config: CloudflareConfig,
    sessionId: string,
    tracks: CloudflareTrack[]
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription: RTCSessionDescriptionInit
    tracks: CloudflareTrack[]
  }>

  /**
   * Pull remote track từ Cloudflare relay
   */
  pullTrack(
    config: CloudflareConfig,
    sessionId: string,
    senderSessionId: string,
    trackNames: string[]
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription: RTCSessionDescriptionInit
    tracks: CloudflareTrack[]
  }>
}

/**
 * Adapter interface cho WebRTC peer connection
 * @see modules/realtime-transport/adapters/webrtc.adapter.ts
 */
export interface WebRTCAdapter {
  /**
   * Tạo RTCPeerConnection với cấu hình cho sẵn
   */
  createPeerConnection(config: WebRTCConfig): RTCPeerConnection
}
