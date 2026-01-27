# 🚀 Quick Start - Realtime Transport Module

Hướng dẫn nhanh để bắt đầu sử dụng module gửi file qua WebRTC.

---

## 1️⃣ Setup Environment Variables

Thêm vào `.env.local`:

```bash
VITE_CLOUDFLARE_APP_ID=your_app_id
VITE_CLOUDFLARE_APP_TOKEN=your_app_token
VITE_CLOUDFLARE_API_BASE=https://api.cloudflare.com
```

---

## 2️⃣ Basic Usage (5 minutes)

### Tạo session

```ts
import { getRealtimeTransportModule } from '@/modules/realtime-transport'

// Khởi tạo module (singleton)
const module = getRealtimeTransportModule()

// Tạo session
const session = await module.sessionManager.createSession({
  participantId: 'user-123',
  conversationId: 'chat-456',
  connectionType: 'duplex',
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
})

console.log('✅ Session created:', session.sessionId)
```

### Tạo data channel

```ts
// Tạo channel để gửi data
const channel = await module.transportService.createDataChannel(session, 'file-transfer')

// Gửi message
channel.send(
  JSON.stringify({
    type: 'hello',
    text: 'Ready to send files!'
  })
)

// Nhận message
channel.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('📨 Received:', data)
}
```

### Đóng session

```ts
await module.sessionManager.closeSession(session.sessionId)
console.log('✅ Session closed')
```

---

## 3️⃣ React Hook Usage (Recommend)

### Create custom hook

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
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let isActive = true

    const initSession = async () => {
      try {
        setStatus('loading')
        const module = getRealtimeTransportModule()
        const newSession = await module.sessionManager.createSession(request)

        if (!isActive) return

        setSession(newSession)
        setStatus('connected')

        // Subscribe to changes
        const unsubscribe = module.sessionManager.onSessionChanged((updated) => {
          if (updated.sessionId === newSession.sessionId) {
            setSession(updated)
          }
        })

        return unsubscribe
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Failed to create session')
          setStatus('error')
        }
      }
    }

    let cleanup: (() => void) | undefined
    initSession().then((fn) => {
      cleanup = fn
    })

    return () => {
      isActive = false
      cleanup?.()
    }
  }, [request.participantId, request.conversationId])

  return { session, status, error }
}
```

### Use in component

```tsx
function FileSharingComponent() {
  const { session, status, error } = useRealtimeSession({
    participantId: 'user-123',
    conversationId: 'chat-456',
    connectionType: 'send',
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
  })

  if (status === 'loading') return <div className="text-center">🔄 Connecting...</div>
  if (status === 'error') return <div className="text-red-500">❌ {error}</div>
  if (!session) return null

  return (
    <div className="p-4 border rounded">
      <h2>📁 File Sharing</h2>
      <p className="text-sm text-gray-600">Session: {session.sessionId}</p>
      <FileUploadForm session={session} />
    </div>
  )
}
```

---

## 4️⃣ File Transfer Example

### Gửi file

```ts
async function sendFile(session: RealtimeSession, file: File) {
  const channel = await module.transportService.createDataChannel(session, 'file')

  // Đợi channel mở
  await new Promise((resolve) => {
    if (channel.readyState === 'open') resolve(null)
    channel.onopen = resolve
  })

  // Gửi metadata
  const metadata = {
    type: 'file-start',
    name: file.name,
    size: file.size,
    mimeType: file.type
  }
  channel.send(JSON.stringify(metadata))

  // Gửi file chunks
  const chunkSize = 16 * 1024 // 16KB
  const reader = new FileReader()
  let offset = 0

  reader.onload = (event) => {
    channel.send(event.target?.result)
    offset += chunkSize

    if (offset < file.size) {
      reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
    } else {
      // Hoàn thành
      channel.send(JSON.stringify({ type: 'file-end', name: file.name }))
      channel.close()
      console.log('✅ File sent')
    }
  }

  reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
}

// Usage
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!
fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && session) {
    await sendFile(session, file)
  }
})
```

### Nhận file

```ts
async function receiveFile(session: RealtimeSession) {
  const channel = await module.transportService.createDataChannel(session, 'file')

  let fileData: Uint8Array[] = []
  let fileMetadata: any = null

  module.transportService.onRemoteDataChannel(session, (event) => {
    const remoteChannel = event.channel

    remoteChannel.onmessage = (e) => {
      // Nếu là JSON message
      if (typeof e.data === 'string') {
        const msg = JSON.parse(e.data)

        if (msg.type === 'file-start') {
          fileMetadata = msg
          fileData = []
          console.log(`📥 Receiving: ${msg.name} (${msg.size} bytes)`)
        } else if (msg.type === 'file-end') {
          // Hoàn thành - tạo blob và download
          const blob = new Blob(fileData, { type: fileMetadata.mimeType })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileMetadata.name
          a.click()
          URL.revokeObjectURL(url)
          console.log('✅ File received and downloaded')
          remoteChannel.close()
        }
      } else {
        // Binary data - add to chunks
        fileData.push(new Uint8Array(e.data))
      }
    }
  })
}
```

---

## 5️⃣ Error Handling

```ts
try {
  const session = await module.sessionManager.createSession(request)
} catch (error) {
  console.error('Failed to create session:', error)
  // Handle error - show toast, retry, etc
}

// Listen for session errors
module.sessionManager.onSessionChanged((session) => {
  if (session.error) {
    console.error('Session error:', session.error)
    // Handle session error
  }

  if (session.status === 'error') {
    console.error('Connection failed')
    // Attempt reconnect or show error message
  }
})
```

---

## 6️⃣ Advanced: Custom Data Channel

```ts
async function setupDataChannel(session: RealtimeSession, name: string) {
  const channel = await module.transportService.createDataChannel(session, name)

  // Configure
  channel.binaryType = 'arraybuffer' // for binary data
  channel.bufferedAmountLowThreshold = 64 * 1024 // 64KB

  // Event handlers
  channel.onopen = () => {
    console.log(`📡 Channel ${name} opened`)
  }

  channel.onclose = () => {
    console.log(`📡 Channel ${name} closed`)
  }

  channel.onerror = (event) => {
    console.error(`⚠️ Channel ${name} error:`, event.error)
  }

  channel.onbufferedamountlow = () => {
    // Process next chunk if was buffering
    console.log('Buffer cleared, ready for more data')
  }

  return channel
}
```

---

## 7️⃣ Cleanup & Best Practices

```ts
// ✅ Always cleanup on unmount
useEffect(() => {
    const initSession = async () => { ... }
    let cleanup: (() => void) | undefined

    initSession().then(fn => { cleanup = fn })

    return () => {
        cleanup?.()
        // Explicitly close session
        // module.sessionManager.closeSession(sessionId)
    }
}, [])

// ✅ Don't create multiple modules
// ❌ SALAŞ: const module = RealtimeTransportModule.getInstance(...)
// ✅ ĐÚNG: const module = getRealtimeTransportModule()

// ✅ Handle data channel buffering
if (channel.bufferedAmount > 1024 * 1024) {
    console.warn('Buffer full, slowing down sends')
    // Implement backpressure
}

// ✅ Use proper types
const session: RealtimeSession = await module.sessionManager.createSession(...)
const channel: RTCDataChannel = await module.transportService.createDataChannel(...)
```

---

## 📊 Checklist

Trước khi deploy:

- [ ] Environment variables set (.env.local)
- [ ] Module initialized once at app startup
- [ ] Sessions cleaned up on unmount
- [ ] Data channel buffering handled
- [ ] Error cases tested
- [ ] Multiple concurrent sessions tested
- [ ] Memory leaks checked (DevTools)
- [ ] Cloudflare API credentials valid

---

## 🆘 Troubleshooting

### Session creation times out

```
→ Kiểm tra Cloudflare API endpoint
→ Kiểm tra API credentials
→ Kiểm tra ICE servers accessibility
```

### Data channel doesn't open

```
→ Đảm bảo peer connection connected
→ Kiểm tra buffer (bufferedAmount)
→ Thử tạo channel sau peer connection ready
```

### Data loss

```
→ Implement ACK/retry mechanism
→ Monitor bufferedAmount
→ Chunk data bằng reasonable size (16KB)
```

---

## 📚 Learn More

- [README.md](./README.md) - Full documentation
- [STRUCTURE.md](./STRUCTURE.md) - Architecture details
- [WebRTC MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Cloudflare Calls API](https://developers.cloudflare.com/calls/)

---

**Status:** ✅ Ready to use
