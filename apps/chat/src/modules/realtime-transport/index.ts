/**
 * realtime-transport Module
 *
 * Public API untuk WebRTC + Cloudflare Calls integration
 *
 * Usage:
 * ```ts
 * import { getRealtimeTransportModule, type RealtimeSession } from '@/modules/realtime-transport'
 *
 * const module = getRealtimeTransportModule()
 * const session = await module.sessionManager.createSession({
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
  WebRTCAdapter
} from './realtime-transport.type'

export type {
  SessionStatus,
  SessionTrack,
  SessionMetadata,
  SessionStateChangeEvent,
  SessionTrackEvent,
  RealtimeSession,
  CreateSessionRequest,
  CreateSessionResponse
} from './types/session.type'

// ============= Services (Public API) =============
export { TransportService } from './services/transport.service'
export { SessionManager } from './services/session-manager.service'

// ============= Module (Public API) =============
export { RealtimeTransportModule, getRealtimeTransportModule } from './realtime-transport.module'

// ============= Adapters (Public API - mostly for testing) =============
export { CloudflareAdapterImpl, createCloudflareAdapter } from './adapters/cloudflare.adapter'
export { WebRTCAdapterImpl, createWebRTCAdapter } from './adapters/webrtc.adapter'
