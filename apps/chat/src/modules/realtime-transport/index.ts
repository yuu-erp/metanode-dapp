/**
 * realtime-transport Module
 *
 * Public API for WebRTC + Cloudflare Calls integration
 *
 * Usage:
 * ```ts
 * import { getRealtimeTransportFactory, type RealtimeSession } from '@/modules/realtime-transport'
 *
 * const factory = getRealtimeTransportFactory()
 * const session = await factory.sessionManager.createSession({
 *   participantId: 'user1',
 *   conversationId: 'conv123',
 *   connectionType: 'duplex',
 *   iceServers: [...]
 * })
 * ```
 */

// ============= Types (Public API) =============
export type {
  CloudflareConfig,
  CloudflareAdapter,
  CloudflareSession,
  CloudflareTrack,
  CloudflareDataChannel,
  WebRTCConfig,
  WebRTCAdapter,
  SessionStatus,
  SessionTrack,
  SessionMetadata,
  SessionStateChangeEvent,
  SessionTrackEvent,
  RealtimeSession,
  CreateSessionRequest,
  CreateSessionResponse
} from './realtime-transport.type'
// ============= Services (Public API) =============
export { TransportService } from './services/transport.service'
export { SessionManager } from './services/session-manager.service'
export { RealtimeTransportFactory, getRealtimeTransportFactory } from './realtime-transport.factory'

// ============= Adapters (Public API - mostly for testing) =============
export { CloudflareAdapterImpl } from './adapters/cloudflare.adapter'
export { WebRTCAdapterImpl } from './adapters/webrtc.adapter'
export { cloudflareConfig, webrtcConfig } from './config'
