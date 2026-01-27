import type {
  CloudflareAdapter,
  CloudflareConfig,
  WebRTCAdapter,
  WebRTCConfig
} from '../realtime-transport.type'
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  RealtimeSession,
  SessionStatus
} from '../types/session.type'

/**
 * TransportService
 *
 * Trách nhiệm:
 * - Orchestrate tạo/đóng sessions
 * - Quản lý lifecycle của peer connections
 * - Handle SDP negotiation
 * - Manage tracks & data channels
 *
 * Không phụ thuộc React, có thể test độc lập
 */
export class TransportService {
  constructor(
    private cloudflareAdapter: CloudflareAdapter,
    private webrtcAdapter: WebRTCAdapter,
    private cloudflareConfig: CloudflareConfig,
    private webrtcConfig: WebRTCConfig
  ) {}

  /**
   * Tạo session mới
   *
   * Flow:
   * 1. Tạo RTCPeerConnection
   * 2. Tạo offer
   * 3. Set local description
   * 4. Gửi offer tới Cloudflare để nhận answer
   * 5. Set remote description (answer từ Cloudflare)
   * 6. Return session object
   */
  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    try {
      // Step 1: Tạo peer connection
      const peerConnection = this.webrtcAdapter.createPeerConnection(this.webrtcConfig)

      // Step 2: Tạo offer (nếu duplex hoặc send)
      let localDescription: RTCSessionDescriptionInit
      if (request.connectionType !== 'receive') {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        localDescription = offer
      } else {
        // Nếu receive-only, tạo local offer rỗng
        const emptyOffer = {
          type: 'offer' as const,
          sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
        }
        await peerConnection.setLocalDescription(emptyOffer)
        localDescription = emptyOffer
      }

      // Step 3: Gửi offer tới Cloudflare
      const cloudflareSession = await this.cloudflareAdapter.createSession(
        this.cloudflareConfig,
        localDescription
      )

      // Step 4: Set remote description (answer từ Cloudflare)
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(cloudflareSession.sessionDescription)
      )

      // Step 5: Create session object
      const session: RealtimeSession = {
        sessionId: cloudflareSession.sessionId,
        peerConnection,
        cloudflareSession,
        metadata: {
          participantId: request.participantId,
          conversationId: request.conversationId,
          connectionType: request.connectionType,
          startedAt: Date.now(),
          lastUpdatedAt: Date.now()
        },
        status: 'connected' as SessionStatus,
        tracks: [],
        dataChannels: new Map(),
        error: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      return { session }
    } catch (error) {
      throw new Error(
        `[TransportService] Failed to create session: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Đóng session
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      await this.cloudflareAdapter.closeSession(this.cloudflareConfig, sessionId)
    } catch (error) {
      throw new Error(
        `[TransportService] Failed to close session: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Thêm track cục bộ và push tới remote
   */
  async addLocalTrack(session: RealtimeSession, track: MediaStreamTrack): Promise<void> {
    try {
      // Thêm track vào peer connection
      session.peerConnection.addTrack(track)

      // Nếu cần, push tới Cloudflare
      // (Implementation tuỳ vào Cloudflare API requirements)
    } catch (error) {
      throw new Error(
        `[TransportService] Failed to add local track: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Tạo data channel
   */
  async createDataChannel(session: RealtimeSession, channelName: string): Promise<RTCDataChannel> {
    try {
      const dataChannel = session.peerConnection.createDataChannel(channelName, {
        ordered: true
      })

      // Lưu reference
      session.dataChannels.set(channelName, dataChannel)

      return dataChannel
    } catch (error) {
      throw new Error(
        `[TransportService] Failed to create data channel: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Handle remote data channel
   */
  onRemoteDataChannel(
    session: RealtimeSession,
    callback: (event: RTCDataChannelEvent) => void
  ): void {
    session.peerConnection.ondatachannel = callback
  }

  /**
   * Handle connection state changes
   */
  onConnectionStateChange(
    session: RealtimeSession,
    callback: (state: RTCPeerConnectionState) => void
  ): void {
    session.peerConnection.onconnectionstatechange = () => {
      callback(session.peerConnection.connectionState)
      session.updatedAt = Date.now()
    }
  }

  /**
   * Handle ICE connection state changes
   */
  onICEConnectionStateChange(
    session: RealtimeSession,
    callback: (state: RTCIceConnectionState) => void
  ): void {
    session.peerConnection.oniceconnectionstatechange = () => {
      callback(session.peerConnection.iceConnectionState)
      session.updatedAt = Date.now()
    }
  }
}

/**
 * Factory function để tạo transport service
 */
export function createTransportService(
  cloudflareAdapter: CloudflareAdapter,
  webrtcAdapter: WebRTCAdapter,
  cloudflareConfig: CloudflareConfig,
  webrtcConfig: WebRTCConfig
): TransportService {
  return new TransportService(cloudflareAdapter, webrtcAdapter, cloudflareConfig, webrtcConfig)
}
