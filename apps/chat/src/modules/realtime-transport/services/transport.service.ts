import type {
  CloudflareAdapter,
  CloudflareConfig,
  CloudflareDataChannel,
  CreateSessionRequest,
  CreateSessionResponse,
  RealtimeSession,
  SessionStatus,
  WebRTCAdapter,
  WebRTCConfig
} from '../realtime-transport.type'
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
  ) {
    console.log('[TransportService] Initialized')
  }

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
      console.log(`[TransportService] Creating session for participant ${request.participantId}`, {
        connectionType: request.connectionType
      })
      // Step 1: Tạo peer connection
      const peerConnection = this.webrtcAdapter.createPeerConnection(this.webrtcConfig)
      console.log('[TransportService] PeerConnection created', peerConnection)

      // Step 2: Tạo offer
      // Cloudflare Calls yêu cầu SDP phải có ít nhất một m-section (media hoặc data)
      // Chúng ta sẽ khởi tạo một DataChannel mặc định để đảm bảo SDP hợp lệ (chứa ice-ufrag, fingerprint, etc.)
      peerConnection.createDataChannel('cloudflare-session-init')

      // Luôn dùng createOffer để đảm bảo SDP hợp lệ
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      const localDescription = offer
      console.log('[TransportService] Local offer created and set')

      // Step 3: Gửi offer tới Cloudflare
      console.log('[TransportService] Sending offer to Cloudflare...')
      const cloudflareSession = await this.cloudflareAdapter.createSession(
        this.cloudflareConfig,
        localDescription
      )
      console.log(`[TransportService] Cloudflare session created: ${cloudflareSession.sessionId}`)

      // Step 4: Set remote description (answer từ Cloudflare)
      console.log('[TransportService] Setting remote description (Cloudflare answer)...')
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(cloudflareSession.sessionDescription)
      )
      console.log('[TransportService] Remote description set successfully')

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
   * Tạo data channel (Sender side)
   */
  async createDataChannel(session: RealtimeSession, channelName: string): Promise<RTCDataChannel> {
    try {
      console.log(
        `[TransportService] Creating DataChannel: ${channelName} for session ${session.sessionId}`
      )

      // 1. Tạo DataChannel trên PeerConnection
      const dataChannel = session.peerConnection.createDataChannel(channelName, {
        ordered: true,
        negotiated: true,
        id: 1
      })

      // 2. Thông báo với Cloudflare
      console.log('[TransportService] Notifying Cloudflare about new send channel...')
      const { requiresImmediateRenegotiation, sessionDescription } =
        await this.cloudflareAdapter.createSendChannel(
          this.cloudflareConfig,
          session.sessionId,
          channelName
        )

      // 3. Xử lý renegotiation nếu Cloudflare yêu cầu
      if (requiresImmediateRenegotiation && sessionDescription) {
        await this.handleRenegotiation(session, sessionDescription)
      }

      // Lưu reference
      session.dataChannels.set(channelName, dataChannel)
      console.log('[TransportService] Data channel created and stored')

      return dataChannel
    } catch (error) {
      throw new Error(
        `[TransportService] Failed to create data channel: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Kết nối tới data channel của partner (Receiver side)
   * Qua Cloudflare relay
   */
  async pullDataChannel(
    session: RealtimeSession,
    senderSessionId: string,
    channelName: string
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription?: RTCSessionDescriptionInit
    dataChannels: CloudflareDataChannel[]
  }> {
    try {
      console.log(
        `[TransportService] Pulling DataChannel ${channelName} from sender ${senderSessionId} into session ${session.sessionId}`
      )
      const { dataChannels, requiresImmediateRenegotiation, sessionDescription } =
        await this.cloudflareAdapter.createReceiveChannel(
          this.cloudflareConfig,
          session.sessionId,
          channelName,
          senderSessionId
        )

      console.log('[TransportService] createReceiveChannel result:', {
        requiresImmediateRenegotiation,
        hasSessionDescription: !!sessionDescription,
        dataChannelsCount: dataChannels.length
      })

      // Xử lý renegotiation nếu Cloudflare yêu cầu
      if (requiresImmediateRenegotiation && sessionDescription) {
        console.log('[TransportService] Triggering renegotiation for pulled channel...')
        await this.handleRenegotiation(session, sessionDescription)
      } else {
        console.warn(
          '[TransportService] No renegotiation required, DataChannel might not be established!'
        )
      }

      console.log(`[TransportService] Data channels pulled: ${dataChannels.length}`)
      return { dataChannels, requiresImmediateRenegotiation, sessionDescription }
    } catch (error) {
      throw new Error(
        `[TransportService] Failed to pull data channel: ${error instanceof Error ? error.message : String(error)}`
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
    console.log('[TransportService] Registering ondatachannel listener')
    session.peerConnection.ondatachannel = (event) => {
      console.log('[TransportService] ondatachannel event fired!', event.channel.label)
      callback(event)
    }
  }

  /**
   * Handle connection state changes
   */
  onConnectionStateChange(
    session: RealtimeSession,
    callback: (state: RTCPeerConnectionState) => void
  ): void {
    session.peerConnection.onconnectionstatechange = () => {
      console.log(
        `[TransportService] ConnectionState change: ${session.peerConnection.connectionState}`
      )
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
      console.log(
        `[TransportService] ICE ConnectionState change: ${session.peerConnection.iceConnectionState}`
      )
      callback(session.peerConnection.iceConnectionState)
      session.updatedAt = Date.now()
    }
  }

  onSignalingStateChange(
    session: RealtimeSession,
    callback: (state: RTCSignalingState) => void
  ): void {
    session.peerConnection.onsignalingstatechange = () => {
      console.log(
        `[TransportService] SignalingState change: ${session.peerConnection.signalingState}`
      )
      callback(session.peerConnection.signalingState)
    }
  }

  /**
   * Xử lý tái thương lượng (Renegotiation)
   * Phổ biến khi Push/Pull tracks hoặc DataChannels
   */
  private async handleRenegotiation(
    session: RealtimeSession,
    sessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    console.log('[TransportService] Renogotiating session...')
    try {
      // 1. Set remote description từ Cloudflare
      await session.peerConnection.setRemoteDescription(
        new RTCSessionDescription(sessionDescription)
      )

      // 2. Nếu Cloudflare gửi offer, chúng ta phải tạo answer và gửi lại cho Cloudflare
      if (sessionDescription.type === 'offer') {
        const answer = await session.peerConnection.createAnswer()
        await session.peerConnection.setLocalDescription(answer)

        console.log('[TransportService] Sending answer back to Cloudflare renegotiate endpoint...')
        await this.cloudflareAdapter.renegotiate(this.cloudflareConfig, session.sessionId, answer)
        console.log('[TransportService] Answer sent and renegotiation finalized')
      }
      console.log('[TransportService] Renegotiation complete')
    } catch (error) {
      console.error('[TransportService] Renegotiation failed:', error)
      throw error
    }
  }
  /**
   * Public method to force renegotiation
   */
  async renegotiate(
    session: RealtimeSession,
    sessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    try {
      console.log('[TransportService] Force renegotiating session...')
      await this.cloudflareAdapter.renegotiate(
        this.cloudflareConfig,
        session.sessionId,
        sessionDescription
      )
    } catch (error) {
      console.error('[TransportService] Force renegotiation failed:', error)
      throw error
    }
  }
}
