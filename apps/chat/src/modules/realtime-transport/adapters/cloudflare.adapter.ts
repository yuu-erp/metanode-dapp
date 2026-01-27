import type {
  CloudflareAdapter,
  CloudflareConfig,
  CloudflareDataChannel,
  CloudflareSession,
  CloudflareTrack
} from '../realtime-transport.type'

/**
 * Concrete implementation của Cloudflare WebRTC API
 *
 * Dùng để:
 * - Tạo/đóng relay sessions
 * - Manage tracks (push/pull)
 * - Manage data channels
 *
 * Không phụ thuộc React, có thể test độc lập
 */
export class CloudflareAdapterImpl implements CloudflareAdapter {
  async createSession(
    config: CloudflareConfig,
    localDescription: RTCSessionDescriptionInit
  ): Promise<CloudflareSession> {
    const url = `${config.apiBase}/api/webrtc`
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        appID: config.appID,
        sessionDescription: localDescription
      })
    })

    if (!response.ok) {
      throw new Error(
        `[CloudflareAdapter] Failed to create session: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return {
      sessionId: data.sessionId,
      sessionDescription: data.sessionDescription
    }
  }

  async createSendChannel(
    config: CloudflareConfig,
    sessionId: string,
    dataChannelName: string
  ): Promise<{ dataChannels: CloudflareDataChannel[] }> {
    const url = `${config.apiBase}/api/webrtc/${sessionId}/datachannels/send`
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        label: dataChannelName
      })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to create send channel: ${response.status}`)
    }

    return await response.json()
  }

  async createReceiveChannel(
    config: CloudflareConfig,
    sessionId: string,
    dataChannelName: string,
    senderSessionId: string
  ): Promise<{ dataChannels: CloudflareDataChannel[] }> {
    const url = `${config.apiBase}/api/webrtc/${sessionId}/datachannels/receive`
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        label: dataChannelName,
        senderSessionId
      })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to create receive channel: ${response.status}`)
    }

    return await response.json()
  }

  async closeSession(config: CloudflareConfig, sessionId: string): Promise<void> {
    const url = `${config.apiBase}/api/webrtc/${sessionId}`
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to close session: ${response.status}`)
    }
  }

  async pushTrack(
    config: CloudflareConfig,
    sessionId: string,
    tracks: CloudflareTrack[]
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription: RTCSessionDescriptionInit
    tracks: CloudflareTrack[]
  }> {
    const url = `${config.apiBase}/api/webrtc/${sessionId}/tracks/send`
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tracks })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to push track: ${response.status}`)
    }

    return await response.json()
  }

  async pullTrack(
    config: CloudflareConfig,
    sessionId: string,
    senderSessionId: string,
    trackNames: string[]
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription: RTCSessionDescriptionInit
    tracks: CloudflareTrack[]
  }> {
    const url = `${config.apiBase}/api/webrtc/${sessionId}/tracks/receive`
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        senderSessionId,
        trackNames
      })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to pull track: ${response.status}`)
    }

    return await response.json()
  }
}

/**
 * Factory function để tạo Cloudflare adapter
 */
export function createCloudflareAdapter(): CloudflareAdapter {
  return new CloudflareAdapterImpl()
}
