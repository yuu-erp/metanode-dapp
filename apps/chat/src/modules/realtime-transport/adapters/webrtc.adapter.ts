import type { WebRTCAdapter, WebRTCConfig } from '../realtime-transport.type'

/**
 * Concrete implementation của WebRTC adapter
 *
 * Dùng để:
 * - Tạo RTCPeerConnection với cấu hình standard
 * - Tách biệt WebRTC initialization từ business logic
 *
 * Không phụ thuộc React, có thể test độc lập
 */
export class WebRTCAdapterImpl implements WebRTCAdapter {
  createPeerConnection(config: WebRTCConfig): RTCPeerConnection {
    const peerConnectionConfig: RTCConfiguration = {
      iceServers: config.iceServers,
      bundlePolicy: config.bundlePolicy || 'balanced'
    }

    return new RTCPeerConnection(peerConnectionConfig)
  }
}
