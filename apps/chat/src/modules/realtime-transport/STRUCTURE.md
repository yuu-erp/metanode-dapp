# Module Structure & Dependencies

## 📁 File Organization

```
realtime-transport/
├── 📄 index.ts                              (Public API export)
├── 📄 README.md                             (User guide & examples)
├── 📄 ADR-002-REALTIME-TRANSPORT.md         (Architecture decision record)
├── 📄 realtime-transport.type.ts            (Core types: CloudflareConfig, WebRTCConfig, adapters)
├── 📄 realtime-transport.module.ts          (DI Container - Singleton)
│
├── 📁 types/
│   └── 📄 session.type.ts                   (Session types: RealtimeSession, SessionMetadata, etc)
│
├── 📁 adapters/
│   ├── 📄 cloudflare.adapter.ts             (CloudflareAdapterImpl - HTTP client)
│   └── 📄 webrtc.adapter.ts                 (WebRTCAdapterImpl - RTCPeerConnection factory)
│
└── 📁 services/
    ├── 📄 transport.service.ts              (TransportService - WebRTC orchestration)
    └── 📄 session-manager.service.ts        (SessionManager - Lifecycle management)
```

---

## 🔗 Dependency Graph

### Import Hierarchy

```
index.ts
├── realtime-transport.type.ts
├── realtime-transport.module.ts
├── types/session.type.ts
├── services/transport.service.ts
├── services/session-manager.service.ts
├── adapters/cloudflare.adapter.ts
└── adapters/webrtc.adapter.ts


realtime-transport.module.ts
├── realtime-transport.type.ts
├── adapters/cloudflare.adapter.ts
├── adapters/webrtc.adapter.ts
├── services/transport.service.ts
└── services/session-manager.service.ts


services/transport.service.ts
├── realtime-transport.type.ts
└── types/session.type.ts


services/session-manager.service.ts
├── types/session.type.ts
└── services/transport.service.ts


adapters/cloudflare.adapter.ts
└── realtime-transport.type.ts

adapters/webrtc.adapter.ts
└── realtime-transport.type.ts
```

### ✅ No Circular Dependencies

```
✓ adapters/ không import services/
✓ services/ không import adapters/ (chỉ import interfaces)
✓ types/ không import gì (pure types)
✓ module.ts là top-level orchestrator
✓ index.ts chỉ re-export
```

---

## 📦 Module Export

### Public API (via index.ts)

```ts
// Types
export type CloudflareConfig
export type CloudflareAdapter
export type CloudflareSession
export type CloudflareTrack
export type CloudflareDataChannel
export type WebRTCConfig
export type WebRTCAdapter

export type SessionStatus
export type SessionTrack
export type SessionMetadata
export type SessionStateChangeEvent
export type SessionTrackEvent
export type RealtimeSession
export type CreateSessionRequest
export type CreateSessionResponse

// Services (mostly for testing)
export class TransportService
export class SessionManager

// Module
export class RealtimeTransportModule
export function getRealtimeTransportModule()

// Adapters (for advanced usage/testing)
export class CloudflareAdapterImpl
export function createCloudflareAdapter()
export class WebRTCAdapterImpl
export function createWebRTCAdapter()
```

### Usage from outside module

```ts
// ✅ Allowed
import {
  getRealtimeTransportModule,
  type RealtimeSession,
  type CreateSessionRequest
} from '@/modules/realtime-transport'

// ❌ Discouraged (internal implementation)
import { CloudflareAdapterImpl } from '@/modules/realtime-transport/adapters/cloudflare.adapter'
```

---

## 🔄 Data Flow Examples

### Session Creation Flow

```
React Hook (useRealtimeSession)
    │
    └─→ getRealtimeTransportModule()
        │
        └─→ module.sessionManager.createSession(request)
            │
            └─→ transportService.createSession(request)
                │
                ├─→ webrtcAdapter.createPeerConnection(config)
                │   └─→ new RTCPeerConnection(config)
                │
                ├─→ peerConnection.createOffer()
                │
                ├─→ peerConnection.setLocalDescription(offer)
                │
                ├─→ cloudflareAdapter.createSession(config, offer)
                │   └─→ fetch(`${apiBase}/api/webrtc`, { POST })
                │
                ├─→ peerConnection.setRemoteDescription(answer)
                │
                └─→ return RealtimeSession {
                        sessionId,
                        peerConnection,
                        cloudflareSession,
                        metadata,
                        status: 'connected',
                        ...
                    }

            └─→ sessionManager.sessions.set(sessionId, session)

            └─→ setupSessionListeners(session)
                ├─→ transportService.onConnectionStateChange(...)
                └─→ transportService.onICEConnectionStateChange(...)

                    └─→ notify subscribers via onSessionChanged()
```

### Data Channel Send Flow

```
React Component
    │
    └─→ dataChannel.send(data)
        │
        └─→ RTCDataChannel (internal WebRTC)
            │
            ├─→ Encode to MessageEvent
            │
            └─→ Send via P2P connection
                │
                └─→ Remote Peer receives
                    │
                    └─→ dataChannel.onmessage event
```

### Session Cleanup Flow

```
React Component unmount
    │
    └─→ useEffect cleanup
        │
        └─→ module.sessionManager.closeSession(sessionId)
            │
            ├─→ Close all data channels
            │   └─→ dc.close() for each in dataChannels Map
            │
            ├─→ Close peer connection
            │   └─→ peerConnection.close()
            │
            ├─→ Call Cloudflare API
            │   └─→ cloudflareAdapter.closeSession(config, sessionId)
            │       └─→ fetch(`${apiBase}/api/webrtc/${sessionId}`, { DELETE })
            │
            ├─→ Remove from sessions Map
            │   └─→ sessions.delete(sessionId)
            │
            └─→ Notify listeners
                └─→ listener(session)
```

---

## 🧪 Testing Strategy

### Unit Test Layers

```
adapters/ - Mock HTTP responses
├── cloudflare.adapter.test.ts
│   └── Mock fetch
│
services/ - Mock adapters
├── transport.service.test.ts
│   ├── Mock CloudflareAdapter
│   └── Mock WebRTCAdapter
│
├── session-manager.service.test.ts
│   └── Mock TransportService
│
module/ - Integration test
└── realtime-transport.module.test.ts
    └── Use real adapters/services
```

### Example Test

```ts
// ✅ Easy to test - no React dependency
describe('TransportService', () => {
    it('should create session with correct SDP', async () => {
        // Arrange
        const mockCloudflareAdapter = {
            createSession: jest.fn().mockResolvedValue({
                sessionId: 'test-123',
                sessionDescription: { type: 'answer', sdp: '...' }
            })
        }
        const mockWebRTCAdapter = {
            createPeerConnection: jest.fn().mockReturnValue(mockPeerConnection)
        }
        const service = new TransportService(
            mockCloudflareAdapter,
            mockWebRTCAdapter,
            cloudflareConfig,
            webrtcConfig
        )

        // Act
        const result = await service.createSession({...})

        // Assert
        expect(mockCloudflareAdapter.createSession).toHaveBeenCalled()
        expect(result.session.status).toBe('connected')
    })
})
```

---

## 🎯 Key Design Patterns

### 1. Adapter Pattern

- `CloudflareAdapter` & `WebRTCAdapter` interfaces
- Hide implementation details
- Easy to mock/stub for testing

### 2. Singleton Pattern

- `RealtimeTransportModule.getInstance()`
- Ensure single instance across app
- Centralized dependency management

### 3. Factory Pattern

- `createCloudflareAdapter()`
- `createWebRTCAdapter()`
- `createTransportService()`
- `createSessionManager()`

### 4. Observer Pattern

- `sessionManager.onSessionChanged(listener)`
- Loosely coupled state updates
- Reactive to session changes

### 5. Facade Pattern

- `RealtimeTransportModule` exposes simple interface
- Hide complex service orchestration
- Single point of entry

---

## 📊 Metrics & Performance

### Key Metrics

```ts
// Session creation time
const start = performance.now()
const session = await module.sessionManager.createSession(request)
const duration = performance.now() - start
console.log(`Session created in ${duration}ms`)

// Active sessions
const activeSessions = module.sessionManager.getAllSessions().length
console.log(`Active sessions: ${activeSessions}`)

// Data channel throughput
dataChannel.bufferedAmount // bytes queued to send
```

### Bundle Size

```
adapters/
├── cloudflare.adapter.ts      ~1.5 KB (HTTP client logic)
└── webrtc.adapter.ts          ~0.3 KB (wrapper)

services/
├── transport.service.ts       ~2.5 KB (orchestration logic)
└── session-manager.service.ts ~1.8 KB (lifecycle)

module/
├── realtime-transport.module.ts ~1.2 KB (DI container)
└── realtime-transport.type.ts   ~1.0 KB (types)

Total: ~8-9 KB (gzipped: ~2-3 KB)
```

---

## ✅ Code Review Checklist

- [ ] No circular dependencies (check with `import-graph`)
- [ ] All adapters are mocked in tests
- [ ] Services have no React imports
- [ ] Error messages have `[ClassName]` prefix for debugging
- [ ] JSDoc comments on public APIs
- [ ] Types are re-exported via index.ts
- [ ] Cleanup functions are called (dataChannels, peer connections)
- [ ] No console.log in production code (except [SessionManager] logs)
- [ ] Async/await used correctly (no unhandled rejections)
- [ ] Memory leaks prevented (listeners unsubscribed, timers cleared)
