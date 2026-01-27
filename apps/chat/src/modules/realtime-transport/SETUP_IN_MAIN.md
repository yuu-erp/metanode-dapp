# 🚀 Setup Realtime Transport - Integration Guide

Hướng dẫn tích hợp realtime-transport module vào ứng dụng.

---

## 📍 Chiến lược khuyến nghị

**Độc lập khởi tạo** ở app entry point (`main.tsx`)

```
main.tsx
├── Import container (existing)
├── Import getRealtimeTransportModule (NEW)
├── Initialize realtime-transport (NEW)
└── Setup React providers
```

---

## 🛠️ Implementation Steps

### Bước 1: Cấu hình Environment Variables

Thêm vào `.env.local`:

```bash
# Cloudflare Calls Configuration
VITE_CLOUDFLARE_APP_ID=your_app_id_here
VITE_CLOUDFLARE_APP_TOKEN=your_app_token_here
VITE_CLOUDFLARE_API_BASE=https://api.cloudflare.com

# Optional: Custom STUN/TURN servers
VITE_ICE_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
```

### Bước 2: Sửa `main.tsx`

Thêm realtime-transport initialization:

```tsx
import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import { QueryClientProvider } from '@tanstack/react-query'
import reportWebVitals from './reportWebVitals.ts'
import { queryClient } from './shared/lib/react-query.ts'

// ✨ NEW: Import realtime-transport
import { getRealtimeTransportModule } from '@/modules/realtime-transport'

import './styles.css'
import '@/shared/lib/i18n'

// ✨ NEW: Initialize realtime-transport (singleton)
// This runs once per app lifecycle
const realtimeTransportModule = getRealtimeTransportModule()
console.log('✅ Realtime transport initialized')

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  history: createHashHistory()
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// ✨ NEW: Export module for use in components
export { realtimeTransportModule }

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

reportWebVitals()
```

### Bước 3: Tạo Hook để sử dụng Module

Tạo file `hooks/use-realtime-transport.ts`:

```ts
import { useEffect } from 'react'
import { realtimeTransportModule } from '@/main'
import type { SessionManager } from '@/modules/realtime-transport'

/**
 * Custom hook để access realtime transport module
 * Giúp components có thể sử dụng session manager
 */
export function useRealtimeTransport() {
  return {
    sessionManager: realtimeTransportModule.sessionManager,
    transportService: realtimeTransportModule.transportService
  }
}

/**
 * Cleanup hook - gọi khi unmount để đóng sessions
 */
export function useRealtimeSessionCleanup(sessionId: string | null) {
  useEffect(() => {
    return () => {
      if (sessionId) {
        realtimeTransportModule.sessionManager.closeSession(sessionId).catch(console.error)
      }
    }
  }, [sessionId])
}
```

### Bước 4: Sử dụng trong Components

```tsx
import { useRealtimeTransport } from '@/hooks/use-realtime-transport'

function FileSharingComponent() {
  const { sessionManager } = useRealtimeTransport()

  const handleStartTransfer = async () => {
    try {
      const session = await sessionManager.createSession({
        participantId: 'user-123',
        conversationId: 'conv-456',
        connectionType: 'duplex',
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
      })

      console.log('✅ Session created:', session.sessionId)
      // Use session...
    } catch (error) {
      console.error('❌ Failed to create session:', error)
    }
  }

  return <button onClick={handleStartTransfer}>📤 Start File Transfer</button>
}
```

---

## 🏗️ Architecture Result

```
main.tsx
├── Initialize container (existing)
├── Initialize realtimeTransportModule (NEW)
│   └── getRealtimeTransportModule() → Singleton
│       ├── SessionManager
│       ├── TransportService
│       ├── CloudflareAdapter
│       └── WebRTCAdapter
└── React providers
    └── Components
        └── useRealtimeTransport() → Access module
```

---

## ✅ Checklist

- [ ] Environment variables configured (.env.local)
- [ ] main.tsx updated with realtime-transport import
- [ ] Custom hooks created for easier access
- [ ] Components can access module
- [ ] No TypeScript errors
- [ ] Module initializes on app load
- [ ] Cleanup on component unmount

---

## 🔍 Alternative: Context Provider

Nếu muốn pass module qua Context (DRY):

```tsx
// context/realtime-transport.context.tsx
import { createContext, useContext } from 'react'
import { getRealtimeTransportModule } from '@/modules/realtime-transport'

const RealtimeTransportContext = createContext(getRealtimeTransportModule())

export function useRealtimeTransport() {
  return useContext(RealtimeTransportContext)
}

export function RealtimeTransportProvider({ children }: { children: React.ReactNode }) {
  const module = getRealtimeTransportModule()

  return (
    <RealtimeTransportContext.Provider value={module}>{children}</RealtimeTransportContext.Provider>
  )
}
```

Sửa main.tsx:

```tsx
import { RealtimeTransportProvider } from '@/context/realtime-transport.context'

root.render(
  <QueryClientProvider client={queryClient}>
    <RealtimeTransportProvider>
      <RouterProvider router={router} />
    </RealtimeTransportProvider>
  </QueryClientProvider>
)
```

---

## 🐛 Troubleshooting

### "Module not found" error

```
→ Kiểm tra import path
→ Verify realtime-transport/index.ts exports
```

### "Environment variables undefined"

```
→ Kiểm tra .env.local có các variables
→ Restart dev server sau thêm .env
```

### "Cannot read properties of undefined"

```
→ Đảm bảo getRealtimeTransportModule() gọi trước React render
→ Check console log "✅ Realtime transport initialized"
```

---

## 📚 Related Files

- [INTEGRATION_WITH_CONTAINER.md](./INTEGRATION_WITH_CONTAINER.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [README.md](./README.md)
- [container.ts](../../../container.ts)
