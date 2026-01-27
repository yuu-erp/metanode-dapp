import type { CloudflareSession } from '../realtime-transport.type'

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
