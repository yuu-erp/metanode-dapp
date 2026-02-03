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

import type {
  CloudflareAdapter,
  CloudflareConfig,
  CloudflareDataChannel,
  CloudflareSession,
  CloudflareTrack
} from '../realtime-transport.type'

export class CloudflareAdapterImpl implements CloudflareAdapter {
  async createSession(
    config: CloudflareConfig,
    localDescription: RTCSessionDescriptionInit
  ): Promise<CloudflareSession> {
    const url = `${config.apiBase}/sessions/new`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.appToken}`,
      ...config.headers
    }
    console.log('[CloudflareAdapter] Creating session...', {
      url,
      headers,
      body: JSON.stringify({
        sessionDescription: localDescription
      })
    })
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
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
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription?: RTCSessionDescriptionInit
    dataChannels: CloudflareDataChannel[]
  }> {
    const url = `${config.apiBase}/sessions/${sessionId}/datachannels/new`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.appToken}`,
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dataChannels: [
          {
            dataChannelName: dataChannelName,
            location: 'local'
          }
        ]
      })
    })

    if (!response.ok) {
      let errorMsg = `[CloudflareAdapter] Failed to create send channel: ${response.status} ${response.statusText}`
      try {
        const errorBody = await response.json()
        console.error('[CloudflareAdapter] Error body:', errorBody)
        if (errorBody && errorBody.dataChannels && errorBody.dataChannels[0]) {
          const detail = errorBody.dataChannels[0]
          errorMsg += ` - ${detail.errorCode}: ${detail.errorDescription}`
        }
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMsg)
    }

    const data = await response.json()
    console.log('[CloudflareAdapter] createSendChannel response:', data)
    return data
  }

  async createReceiveChannel(
    config: CloudflareConfig,
    sessionId: string,
    dataChannelName: string,
    senderSessionId: string
  ): Promise<{
    requiresImmediateRenegotiation: boolean
    sessionDescription?: RTCSessionDescriptionInit
    dataChannels: CloudflareDataChannel[]
  }> {
    const url = `${config.apiBase}/sessions/${sessionId}/datachannels/new`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.appToken}`,
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dataChannels: [
          {
            dataChannelName: dataChannelName,
            location: 'remote',
            sessionId: senderSessionId
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to create receive channel: ${response.status}`)
    }

    const data = await response.json()
    console.log('[CloudflareAdapter] createReceiveChannel response:', data)
    return data
  }

  async closeSession(config: CloudflareConfig, sessionId: string): Promise<void> {
    const url = `${config.apiBase}/sessions/${sessionId}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.appToken}`,
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
    const url = `${config.apiBase}/sessions/${sessionId}/tracks/new`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.appToken}`,
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tracks: tracks.map((t) => ({
          trackName: t.trackName,
          location: 'local'
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to push track: ${response.status}`)
    }

    const data = await response.json()
    console.log('[CloudflareAdapter] pushTrack response:', data)
    return data
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
    const url = `${config.apiBase}/sessions/${sessionId}/tracks/new`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.appToken}`,
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tracks: trackNames.map((name) => ({
          trackName: name,
          location: 'remote',
          sessionId: senderSessionId
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to pull track: ${response.status}`)
    }

    const data = await response.json()
    console.log('[CloudflareAdapter] pullTrack response:', data)
    return data
  }

  async renegotiate(
    config: CloudflareConfig,
    sessionId: string,
    localDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    const url = `${config.apiBase}/sessions/${sessionId}/renegotiate`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.appToken}`,
      ...config.headers
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        sessionDescription: localDescription
      })
    })

    if (!response.ok) {
      throw new Error(`[CloudflareAdapter] Failed to renegotiate: ${response.status}`)
    }
  }
}
