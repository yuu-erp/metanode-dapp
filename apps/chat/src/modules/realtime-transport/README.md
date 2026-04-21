# Realtime Transport Module

The `realtime-transport` module provides a high-level API for handling Real-Time Communication (WebRTC) integrated with Cloudflare Calls. It abstracts away the complexity of SDP negotiation, ICE candidate management, and Cloudflare-specific relay sessions.

## Architecture

The module follows a Clean Architecture approach, separating concerns into Adapters, Services, and a central Factory.

- **Adapters**: Low-level interfaces to external systems (WebRTC API, Cloudflare REST API).
- **Services**: Business logic for session management, track manipulation, and data channels.
- **Factory**: The composition root that initializes all dependencies and provides a singleton access point.

## Core Components

### `RealtimeTransportFactory`

The main entry point (Singleton). Use it to access the `SessionManager` and `TransportService`.

### `SessionManager`

Responsible for the lifecycle of active sessions. Use it to:

- Create and close sessions.
- Get active sessions by ID or conversation.
- Subscribe to session state changes.

### `TransportService`

Orchestrates low-level WebRTC and Cloudflare API calls.

- SDP Offer/Answer negotiation.
- WebRTC Peer Connection management.
- Adding/removing tracks and data channels.

## Usage

### 1. Basic Integration

The module is already integrated into the global `AppContainer`. Components should access it via the `container`.

```ts
import { container } from '@/container'

// Get access to services
const { sessionManager, transportService } = container
```

### 2. Creating a Session

To start a connection (push/pull or duplex), create a session:

```ts
const session = await container.sessionManager.createSession({
  participantId: 'user-123',
  conversationId: 'conversation-abc',
  connectionType: 'duplex', // 'send' | 'receive' | 'duplex'
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
})
```

### 3. Monitoring Session Status

Subscribe to changes to update your UI:

```ts
const unsubscribe = container.sessionManager.onSessionChanged((session) => {
  console.log(`Session ${session.sessionId} status changed to: ${session.status}`)

  if (session.status === 'connected') {
    // Show call UI
  }
})
```

## Configuration

The module uses environment variables for Cloudflare authentication:

- `VITE_CLOUDFLARE_APP_ID`: Your Cloudflare App ID.
- `VITE_CLOUDFLARE_APP_TOKEN`: Your Cloudflare API Token.
- `VITE_CLOUDFLARE_API_BASE`: Cloudflare Calls API base URL.

These are configured in `src/modules/realtime-transport/config/index.ts`.
