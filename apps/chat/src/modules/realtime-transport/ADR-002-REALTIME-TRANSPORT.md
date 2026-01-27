# ADR-002: Realtime Transport Module Architecture

**Status:** Accepted  
**Date:** January 27, 2026  
**Context:** File sending feature requires WebRTC peer-to-peer communication via Cloudflare Calls relay

---

## Problem Statement

Ứng dụng cần gửi files peer-to-peer thông qua WebRTC data channels, nhưng:

- Cần abstraction tốt để dễ test
- Cần isolate external APIs (Cloudflare, WebRTC browser API)
- Cần quản lý lifecycle của multiple concurrent sessions
- Cần tách biệt business logic khỏi UI rendering

## Decision

Áp dụng **Adapter + Service + Module** pattern:

```
Adapters (External APIs)
    ↓
Services (Business Logic)
    ↓
Module (DI Container)
    ↓
React Components (UI)
```

### Layer 1: Adapters

Tách biệt Cloudflare API và WebRTC API thành interfaces:

```ts
// Cloudflare API client
export interface CloudflareAdapter {
    createSession(...): Promise<CloudflareSession>
    createSendChannel(...): Promise<...>
    createReceiveChannel(...): Promise<...>
    closeSession(...): Promise<void>
    pushTrack(...): Promise<...>
    pullTrack(...): Promise<...>
}

// WebRTC wrapper
export interface WebRTCAdapter {
    createPeerConnection(config): RTCPeerConnection
}
```

**Lợi ích:**

- Dễ mock cho testing
- Dễ swap implementation (e.g., thay đổi Cloudflare provider)
- Không phụ thuộc React

### Layer 2: Services

Orchestrate adapters để implement business logic:

```ts
// TransportService: WebRTC negotiation + data channel management
class TransportService {
  async createSession(request): Promise<CreateSessionResponse>
  async addLocalTrack(session, track): Promise<void>
  async createDataChannel(session, name): Promise<RTCDataChannel>
  onConnectionStateChange(session, callback): void
}

// SessionManager: lifecycle + cleanup + state tracking
class SessionManager {
  async createSession(request): Promise<RealtimeSession>
  async closeSession(sessionId): Promise<void>
  onSessionChanged(listener): () => void
}
```

**Lợi ích:**

- Không import React (dễ test, reusable)
- Single responsibility
- Dependency injection sẵn

### Layer 3: DI Container (Module)

```ts
class RealtimeTransportModule {
  static getInstance(config): RealtimeTransportModule

  transportService: TransportService
  sessionManager: SessionManager
  cloudflareAdapter: CloudflareAdapter
  webrtcAdapter: WebRTCAdapter
}
```

**Lợi ích:**

- Singleton pattern - giảm duplicate instances
- Centralized dependency resolution
- Dễ reset/cleanup (e.g., trong test)

### Layer 4: React Integration

```ts
// Custom hook
export function useRealtimeSession(request: CreateSessionRequest) {
  const [session, setSession] = useState<RealtimeSession | null>(null)
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')

  useEffect(() => {
    const module = getRealtimeTransportModule()
    const unsubscribe = module.sessionManager.onSessionChanged((updated) => {
      setSession(updated)
    })
    // cleanup...
  }, [])

  return { session, status }
}
```

**Lợi ích:**

- React chỉ handle rendering
- Business logic hoàn toàn tách biệt
- Dễ test hook riêng lẻ

---

## Trade-offs

### ✅ Lợi ích

1. **Testability** - Services không phụ thuộc React, easy to unit test
2. **Reusability** - Có thể dùng module từ CLI/Node backend nếu cần
3. **Maintainability** - Clear boundaries, easy to trace data flow
4. **Scalability** - Dễ extend (e.g., thêm analytics, retry logic)
5. **Isolation** - External APIs isolated → dễ mock/stub

### ⚖️ Trade-offs

1. **Verbosity** - Nhiều files, nhiều indirection (adapters → services → module)
2. **Learning curve** - Team cần hiểu pattern này
3. **Runtime overhead** - Thêm layers có thể slow down slightly (negligible)

### Comparison

```
❌ Monolithic Approach:
- 1 file, easy to understand initially
- Hard to test
- Hard to replace Cloudflare with another provider
- Business logic mixed with UI

✅ Layered Approach:
- Multiple files, clear separation
- Easy to unit test services
- Easy to swap adapters
- Business logic isolated
```

---

## Implementation Details

### Type Safety

```ts
// Chỉ expose public types qua index.ts
export type { CloudflareConfig, CloudflareAdapter, RealtimeSession, ... }

// Internal types chỉ dùng trong module
// (không expose ra ngoài)
```

### Error Handling

```ts
// Services throw meaningful errors
throw new Error(`[TransportService] Failed to create session: ${originalError}`)

// SessionManager catches and notifies listeners
try {
  await transportService.closeSession(id)
} catch (error) {
  console.error('[SessionManager] Error:', error)
}
```

### Lifecycle Management

```ts
// Session create flow
1. UI: module.sessionManager.createSession(request)
2. SessionManager: transportService.createSession(request)
3. TransportService: adapter.createSession() + setup listeners
4. Return: RealtimeSession object
5. SessionManager: store in Map, setup cleanup listeners

// Session close flow
1. UI: module.sessionManager.closeSession(id)
2. SessionManager: close data channels, peer connection
3. SessionManager: call adapter.closeSession()
4. SessionManager: remove from Map, notify listeners
```

---

## Future Considerations

1. **Analytics** - Add metrics (connection time, data throughput)
2. **Retry Logic** - Auto-reconnect with exponential backoff
3. **Multiple Providers** - Support other relay services (e.g., Twilio)
4. **Compression** - Add data compression for efficient transmission
5. **Encryption** - E2E encryption layer on top of data channels

---

## References

- WebRTC MDN: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- Cloudflare Calls: https://developers.cloudflare.com/calls/
- Previous: [ADR-001: Domain-driven + Layered Architecture](./ADR-001.md)
