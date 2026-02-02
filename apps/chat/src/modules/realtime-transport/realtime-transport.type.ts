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
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription?: RTCSessionDescriptionInit
    dataChannels: CloudflareDataChannel[]
  }>

  /**
   * Tạo data channel receive
   */
  createReceiveChannel(
    config: CloudflareConfig,
    sessionId: string,
    dataChannelName: string,
    senderSessionId: string
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription?: RTCSessionDescriptionInit
    dataChannels: CloudflareDataChannel[]
  }>

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

  /**
   * Renegotiate session (send answer for remote offer)
   */
  renegotiate(
    config: CloudflareConfig,
    sessionId: string,
    localDescription: RTCSessionDescriptionInit
  ): Promise<void>
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

/**
 * Trạng thái của một session
 */
export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error'

/**
 * Thông tin track (audio/video/data) trong session
 */
export interface SessionTrack {
  trackName: string
  mid: string
  kind: 'audio' | 'video' | 'application' // application = data channel
  enabled: boolean
  createdAt: number
}

/**
 * Metadata của session
 */
export interface SessionMetadata {
  participantId: string
  conversationId: string
  connectionType: 'send' | 'receive' | 'duplex'
  startedAt: number
  lastUpdatedAt: number
}

/**
 * Event payload khi session state thay đổi
 */
export interface SessionStateChangeEvent {
  sessionId: string
  status: SessionStatus
  timestamp: number
  error?: Error | null
}

/**
 * Event payload khi track được add/remove
 */
export interface SessionTrackEvent {
  sessionId: string
  track: SessionTrack
  eventType: 'added' | 'removed' | 'updated'
  timestamp: number
}

/**
 * Core session object
 * Đại diện cho một peer-to-peer relay connection qua Cloudflare
 */
export interface RealtimeSession {
  sessionId: string
  peerConnection: RTCPeerConnection
  cloudflareSession: CloudflareSession
  metadata: SessionMetadata
  status: SessionStatus
  tracks: SessionTrack[]
  dataChannels: Map<string, RTCDataChannel>
  error: Error | null
  createdAt: number
  updatedAt: number
}

/**
 * Request để tạo session mới
 */
export interface CreateSessionRequest {
  participantId: string
  conversationId: string
  connectionType: 'send' | 'receive' | 'duplex'
  iceServers: RTCIceServer[]
}

/**
 * Response từ createSession
 */
export interface CreateSessionResponse {
  session: RealtimeSession
}
