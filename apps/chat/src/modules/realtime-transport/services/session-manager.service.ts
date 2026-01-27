import type { CreateSessionRequest, RealtimeSession } from '../types/session.type'
import type { TransportService } from './transport.service'

/**
 * SessionManager
 *
 * Trách nhiệm:
 * - Maintain map của active sessions
 * - Create/delete sessions
 * - Cleanup resources khi session đóng
 * - Notify listeners khi session state thay đổi
 *
 * Không phụ thuộc React, có thể test độc lập
 */
export class SessionManager {
  private sessions: Map<string, RealtimeSession> = new Map()
  private listeners: Set<(session: RealtimeSession) => void> = new Set()

  constructor(private transportService: TransportService) {}

  /**
   * Tạo session mới
   */
  async createSession(request: CreateSessionRequest): Promise<RealtimeSession> {
    const { session } = await this.transportService.createSession(request)
    this.sessions.set(session.sessionId, session)

    // Setup auto-cleanup listeners
    this.setupSessionListeners(session)

    return session
  }

  /**
   * Lấy session theo ID
   */
  getSession(sessionId: string): RealtimeSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Lấy tất cả sessions
   */
  getAllSessions(): RealtimeSession[] {
    return Array.from(this.sessions.values())
  }

  /**
   * Lấy sessions của một conversation
   */
  getSessionsByConversation(conversationId: string): RealtimeSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.metadata.conversationId === conversationId
    )
  }

  /**
   * Đóng session
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`[SessionManager] Session not found: ${sessionId}`)
    }

    try {
      // Close Cloudflare session
      await this.transportService.closeSession(sessionId)

      // Close all data channels
      session.dataChannels.forEach((dc) => {
        if (dc.readyState === 'open') {
          dc.close()
        }
      })

      // Close peer connection
      session.peerConnection.close()

      // Remove từ map
      this.sessions.delete(sessionId)

      // Notify listeners
      this.notifyListeners(session)
    } catch (error) {
      throw new Error(
        `[SessionManager] Failed to close session: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Đóng tất cả sessions
   */
  async closeAllSessions(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys())
    for (const sessionId of sessionIds) {
      try {
        await this.closeSession(sessionId)
      } catch (error) {
        console.error(`[SessionManager] Error closing session ${sessionId}:`, error)
      }
    }
  }

  /**
   * Subscribe to session changes
   */
  onSessionChanged(listener: (session: RealtimeSession) => void): () => void {
    this.listeners.add(listener)
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Setup listeners cho session lifecycle
   */
  private setupSessionListeners(session: RealtimeSession): void {
    this.transportService.onConnectionStateChange(session, (state) => {
      // Update session status
      if (state === 'connected' || state === 'new') {
        session.status = 'connected'
      } else if (state === 'disconnected') {
        session.status = 'disconnecting'
      } else if (state === 'failed') {
        session.status = 'error'
      }

      this.notifyListeners(session)
    })

    this.transportService.onICEConnectionStateChange(session, (state) => {
      // Log ICE state changes
      console.log(`[SessionManager] ICE state changed for session ${session.sessionId}:`, state)
    })
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(session: RealtimeSession): void {
    this.listeners.forEach((listener) => {
      try {
        listener(session)
      } catch (error) {
        console.error('[SessionManager] Error in listener:', error)
      }
    })
  }
}

/**
 * Factory function để tạo session manager
 */
export function createSessionManager(transportService: TransportService): SessionManager {
  return new SessionManager(transportService)
}
