# Realtime Transport Module

Module để quản lý **WebRTC peer-to-peer connections** với **Cloudflare Calls** relay service.

## 📋 Tổng quan

```
┌─────────────────────────────────────────┐
│   React Components / Hooks              │ (UI Layer)
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   RealtimeTransportModule (Singleton)   │ (DI Container)
├──────────────────────────────────────────┤
│   ├─ SessionManager                     │ (Session Lifecycle)
│   ├─ TransportService                   │ (Business Logic)
│   ├─ CloudflareAdapter                  │ (API Client)
│   └─ WebRTCAdapter                      │ (Browser API)
└──────────────────────────────────────────┘
```

## 🏗️ Kiến trúc

```
realtime-transport/
├── index.ts                              # Public API
├── realtime-transport.type.ts            # Core type definitions
├── realtime-transport.module.ts          # DI Container (Singleton)
├── types/
│   └── session.type.ts                   # Session-related types
├── adapters/
│   ├── cloudflare.adapter.ts             # Cloudflare Calls API client
│   └── webrtc.adapter.ts                 # RTCPeerConnection wrapper
└── services/
    ├── transport.service.ts              # WebRTC orchestration
    └── session-manager.service.ts        # Session lifecycle management
```

### Nguyên tắc kiến trúc

✅ **Thế nào là đúng:**

- UI chỉ gọi `SessionManager` hoặc `TransportService`
- Services không biết về React (dễ test, reusable)
- Adapters tách biệt external APIs (Cloudflare, WebRTC)
- DI Container quản lý toàn bộ dependencies

❌ **Thế nào là sai:**

- UI gọi trực tiếp adapters
- Services import React hooks
- Adapters phụ thuộc vào services
- Circular dependencies

## 🚀 Sử dụng

### 1. Khởi tạo module

```ts
// app.tsx hoặc main.tsx
import { getRealtimeTransportModule } from '@/modules/realtime-transport'

// Singleton instance tự động khởi tạo
const module = getRealtimeTransportModule()
```

### 2. Tạo session

```ts
// Trong hook hoặc service
const module = getRealtimeTransportModule()

const session = await module.sessionManager.createSession({
  participantId: 'user-123',
  conversationId: 'conv-456',
  connectionType: 'duplex', // 'send' | 'receive' | 'duplex'
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
})

console.log('Session created:', session.sessionId)
```

### 3. Sử dụng data channels

```ts
const module = getRealtimeTransportModule()
const session = module.sessionManager.getSession(sessionId)!

// Tạo data channel
const dataChannel = await module.transportService.createDataChannel(session, 'chat')

// Gửi message
dataChannel.send(JSON.stringify({ text: 'Hello!' }))

// Nhận message
dataChannel.onmessage = (event) => {
  const message = JSON.parse(event.data)
  console.log('Received:', message.text)
}
```

### 4. Listen to session state changes

```ts
const module = getRealtimeTransportModule()

// Subscribe to session changes
const unsubscribe = module.sessionManager.onSessionChanged((session) => {
  console.log('Session state:', session.status)
  console.log('Connected:', session.status === 'connected')
})

// Cleanup khi unmount
// unsubscribe()
```

### 5. Đóng session

```ts
const module = getRealtimeTransportModule()

await module.sessionManager.closeSession(sessionId)
// hoặc đóng tất cả
await module.sessionManager.closeAllSessions()
```

## 🪝 Custom Hook Pattern

```ts
// hooks/use-realtime-session.ts
import { useEffect, useState } from 'react'
import {
  getRealtimeTransportModule,
  type RealtimeSession,
  type CreateSessionRequest
} from '@/modules/realtime-transport'

export function useRealtimeSession(request: CreateSessionRequest) {
  const [session, setSession] = useState<RealtimeSession | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initSession = async () => {
      try {
        setStatus('loading')
        const module = getRealtimeTransportModule()
        const newSession = await module.sessionManager.createSession(request)
        setSession(newSession)
        setStatus('connected')

        // Listen to state changes
        const unsubscribe = module.sessionManager.onSessionChanged((updated) => {
          if (updated.sessionId === newSession.sessionId) {
            setSession(updated)
          }
        })

        return unsubscribe
      } catch (err) {
        setError(err as Error)
        setStatus('error')
      }
    }

    const cleanup = initSession()

    return () => {
      cleanup?.then((fn) => fn?.())
    }
  }, [request.participantId, request.conversationId])

  return { session, status, error }
}
```

## 🔌 Environment Variables

```bash
VITE_CLOUDFLARE_APP_ID=your_app_id
VITE_CLOUDFLARE_APP_TOKEN=your_app_token
VITE_CLOUDFLARE_API_BASE=https://api.cloudflare.com
```

## 🧪 Testing

```ts
// test/realtime-transport.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createCloudflareAdapter,
  createWebRTCAdapter,
  TransportService,
  SessionManager
} from '@/modules/realtime-transport'

describe('TransportService', () => {
  let transportService: TransportService

  beforeEach(() => {
    const cfAdapter = createCloudflareAdapter()
    const rtcAdapter = createWebRTCAdapter()
    transportService = new TransportService(
      cfAdapter,
      rtcAdapter,
      {
        appID: 'test',
        appToken: 'test',
        apiBase: 'http://localhost:3000'
      },
      {
        iceServers: []
      }
    )
  })

  it('should create a session', async () => {
    const session = await transportService.createSession({
      participantId: 'user1',
      conversationId: 'conv1',
      connectionType: 'duplex',
      iceServers: []
    })

    expect(session.sessionId).toBeDefined()
    expect(session.status).toBe('connected')
  })
})
```

## 📊 Data Flow

### Tạo session

```
React Component
    ↓ (call module.sessionManager.createSession)
SessionManager
    ↓ (delegate to)
TransportService
    ├─ WebRTCAdapter.createPeerConnection()
    ├─ RTCPeerConnection.createOffer()
    ├─ CloudflareAdapter.createSession()
    └─ RTCPeerConnection.setRemoteDescription()
    ↓ (return)
RealtimeSession object
    ↓ (store in Map)
SessionManager (maintains active sessions)
```

### Gửi message

```
React Component
    ↓ (call dataChannel.send(data))
RTCDataChannel
    ├─ Encode message
    └─ Send via P2P connection
    ↓
Remote Peer
    ↓ (receive)
RTCDataChannel.onmessage
```

## ⚠️ Common Pitfalls

1. **Quên cleanup:**

   ```ts
   // ❌ SALAŞ - Session không bao giờ đóng
   const session = await module.sessionManager.createSession(...)

   // ✅ ĐÚNG - Cleanup trong useEffect
   useEffect(() => {
       const init = async () => { ... }
       return () => { await module.sessionManager.closeSession(sessionId) }
   }, [])
   ```

2. **Gọi module không đúng cách:**

   ```ts
   // ❌ SALAŞ - Tạo instance mới mỗi lần
   const module = RealtimeTransportModule.getInstance(...)

   // ✅ ĐÚNG - Dùng getter function
   const module = getRealtimeTransportModule()
   ```

3. **Race condition khi setup listeners:**

   ```ts
   // ❌ SALAŞ - Listener chưa setup khi có event
   const session = await createSession(...)
   setTimeout(() => module.transportService.onConnectionStateChange(...), 0)

   // ✅ ĐÚNG - Setup listeners ngay sau tạo session
   const session = await createSession(...)
   module.transportService.onConnectionStateChange(session, (state) => {...})
   ```

## 🔄 API Reference

### SessionManager

```ts
// Create session
async createSession(request: CreateSessionRequest): Promise<RealtimeSession>

// Get session
getSession(sessionId: string): RealtimeSession | undefined
getAllSessions(): RealtimeSession[]
getSessionsByConversation(conversationId: string): RealtimeSession[]

// Close session
async closeSession(sessionId: string): Promise<void>
async closeAllSessions(): Promise<void>

// Subscribe to changes
onSessionChanged(listener: (session: RealtimeSession) => void): () => void
```

### TransportService

```ts
// Create/close
async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse>
async closeSession(sessionId: string): Promise<void>

// Manage tracks
async addLocalTrack(session: RealtimeSession, track: MediaStreamTrack): Promise<void>

// Manage data channels
async createDataChannel(session: RealtimeSession, channelName: string): Promise<RTCDataChannel>

// Event handlers
onRemoteDataChannel(session: RealtimeSession, callback: (event: RTCDataChannelEvent) => void): void
onConnectionStateChange(session: RealtimeSession, callback: (state: RTCPeerConnectionState) => void): void
onICEConnectionStateChange(session: RealtimeSession, callback: (state: RTCIceConnectionState) => void): void
```

## 📚 Liên quan

- [WebRTC MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Cloudflare Calls](https://developers.cloudflare.com/calls/)
- [ARCHITECTURE_README](../ARCHITECTURE_README.md) - Kiến trúc toàn ứng dụng
