# 📊 REVIEW `container.ts` & Tích hợp Realtime Transport

**Ngày:** January 27, 2026  
**File:** `/apps/chat/src/container.ts`  
**Mục đích:** Composition root - khởi tạo & quản lý dependencies

---

## 📋 PHÂN TÍCH FILE `container.ts`

### Cấu trúc hiện tại

```ts
AppContainer (Singleton)
├── Infra / Low-level services
│   ├── WalletService (wallet adapter)
│   ├── FactoryContract (blockchain)
│   ├── UserContract (blockchain)
│   ├── EventLogContainer
│   └── EventBusPort<AppEvents> (Mitt)
│
└── Application services
    ├── AccountService
    ├── ConversationService
    └── MessageService
```

### Đặc điểm

✅ **Điểm tốt:**

1. **Composition root pattern** - Đúng cách khởi tạo dependencies
2. **Singleton instance** - Module-level guarantee (khởi tạo 1 lần)
3. **Type-safe** - TypeScript generics với AppEvents
4. **Clear separation** - Infra layer vs Application layer
5. **Read-only getters** - Immutable public API
6. **Constructor injection** - Dependencies rõ ràng

⚠️ **Các vấn đề hiện tại:**

1. **Không có event log integration** - `EventLogContainer` chỉ tạo, không dùng
2. **Không có message broadcast** - MessageService không connect với EventBus
3. **Tight coupling** - Services nhìn thấy low-level adapters
4. **Không có cleanup** - Không có `destroy()` method

---

## 🚀 CÓ THỂ TÍCH HỢP REALTIME TRANSPORT KHÔNG?

### ✅ **CÓ, HOÀN TOÀN CÓ THỂ** - Vài lý do:

#### 1. **Architecture phù hợp**

```
Container pattern ← → Module pattern
  (AppContainer)      (RealtimeTransportModule)
      ✓                        ✓
   Singleton              Singleton
   Composition root       DI Container
   Dependency manage      Dependency manage
```

#### 2. **RealtimeTransportModule độc lập**

- Không cần import từ container
- Có singleton riêng: `getRealtimeTransportModule()`
- Không phụ thuộc AppContainer
- Có thể khởi tạo riêng biệt

#### 3. **Không có conflict**

- RealtimeTransport về network/WebRTC
- AppContainer về account/conversation/message
- Hai domain khác nhau, không xung đột

#### 4. **Optional integration**

- Có thể:
  - **Cách 1** - Khởi tạo độc lập (hiện tại)
  - **Cách 2** - Tích hợp vào container (nếu muốn centralize)

---

## 📌 KHUYẾN NGHỊ: 2 Cách tích hợp

### **Cách 1: Độc lập (RECOMMEND - giữ nguyên)**

✅ **Ưu điểm:**

- RealtimeTransport vẫn tự quản lý
- Không phải edit container
- Dễ remove nếu cần
- Parallel initialization

```ts
// main.tsx - App level
import { getRealtimeTransportModule } from '@/modules/realtime-transport'

function App() {
  // Module tự initialize
  const realtimeModule = getRealtimeTransportModule()

  return (
    <AppProvider container={container} realtimeModule={realtimeModule}>
      <Router />
    </AppProvider>
  )
}
```

⚠️ **Nhược điểm:**

- Có 2 singleton instances
- Cần pass module vào context nếu components cần

---

### **Cách 2: Tích hợp vào Container (Alternative)**

✅ **Ưu điểm:**

- Một điểm quản lý tất cả
- Dễ inject vào services
- Centralized initialization
- Dễ cleanup/destroy

⚠️ **Nhược điểm:**

- Phải edit container (đối với mỗi module mới)
- Module ngồi chồng chất trong container
- Phức tạp hơn

**Cách implement:**

```ts
// container.ts
import { RealtimeTransportModule, type SessionManager } from '@/modules/realtime-transport'

class AppContainer {
  // Thêm realtime transport
  private readonly _realtimeModule: RealtimeTransportModule

  constructor() {
    // ... existing code ...

    // Khởi tạo realtime transport
    this._realtimeModule = RealtimeTransportModule.getInstance({
      cloudflareConfig: {
        appID: import.meta.env.VITE_CLOUDFLARE_APP_ID || '',
        appToken: import.meta.env.VITE_CLOUDFLARE_APP_TOKEN || '',
        apiBase: import.meta.env.VITE_CLOUDFLARE_API_BASE || 'https://api.cloudflare.com'
      },
      webrtcConfig: {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] }
        ]
      }
    })
  }

  get realtimeModule(): RealtimeTransportModule {
    return this._realtimeModule
  }

  get sessionManager(): SessionManager {
    return this._realtimeModule.sessionManager
  }

  get transportService() {
    return this._realtimeModule.transportService
  }

  // Add cleanup method
  async destroy(): Promise<void> {
    await this._realtimeModule.destroy()
    // ... cleanup other services ...
  }
}
```

---

## 🎯 KHUYẾN NGHỊ CUỐI CÙNG

### ✅ **CHỌN CÁCH 1: Độc lập** (Recommended)

**Lý do:**

1. **Separation of concerns** - RealtimeTransport là domain khác
2. **Independent lifecycle** - P2P sessions khác account/conversation
3. **Flexible** - Có thể enable/disable mà không sửa container
4. **Scalable** - Khi thêm modules khác, không phải edit container
5. **Current best practice** - Module systems độc lập

**Cách triển khai:**

#### Bước 1: Setup environment variables

```bash
VITE_CLOUDFLARE_APP_ID=...
VITE_CLOUDFLARE_APP_TOKEN=...
VITE_CLOUDFLARE_API_BASE=https://api.cloudflare.com
```

#### Bước 2: Initialize ở app level

```tsx
// main.tsx
import { getRealtimeTransportModule } from '@/modules/realtime-transport'

const container = ... // existing
const realtimeModule = getRealtimeTransportModule()

// Export để dùng ở components
export { container, realtimeModule }
```

#### Bước 3: Use ở components

```tsx
import { realtimeModule } from '@/main'

function FileTransferComponent() {
  const { session, status } = useRealtimeSession({
    participantId: userID,
    conversationId: chatID,
    connectionType: 'duplex',
    iceServers: [...]
  })

  // ...
}
```

---

## 📊 So sánh 2 Cách

| Aspect         | Cách 1 (Độc lập)       | Cách 2 (Tích hợp)     |
| -------------- | ---------------------- | --------------------- |
| Complexity     | ⭐ (simple)            | ⭐⭐⭐ (complex)      |
| Scalability    | ✅ Good                | ⚠️ Maintenance        |
| Separation     | ✅ Clear               | ⚠️ Mixed              |
| Initialization | ⚠️ Multiple singletons | ✅ One container      |
| Flexibility    | ✅ Easy disable        | ⚠️ Hard change        |
| Recommended    | ✅ YES                 | ⚠️ Only if centralize |

---

## 🎯 Nếu chọn Cách 2, cần sửa gì?

Nếu sau này muốn tích hợp vào container, chỉ cần:

1. Thêm import ở top
2. Thêm private field `_realtimeModule`
3. Khởi tạo ở constructor
4. Thêm getter
5. Thêm `destroy()` method

**Effort:** ~50 dòng code, không phức tạp

---

## ✅ KẾT LUẬN

### Current Recommendation: **Cách 1 (Độc lập)**

**Giữ container.ts nguyên**, khởi tạo realtime-transport ở:

- `main.tsx` (app entry point)
- hoặc context provider level
- hoặc custom hook

### Lợi ích:

```
✅ container.ts vẫn clean & focused
✅ RealtimeTransport tự manage lifecycle
✅ Dễ test / mock / replace
✅ Scalable khi thêm modules khác
✅ Không cần sync giữa 2 singleton
✅ Professional architecture pattern
```

### Nếu sau này cần tích hợp:

Rất dễ, chỉ cần thêm ~50 dòng vào container.ts

---

## 📎 Files liên quan

- [container.ts](./container.ts) - Composition root (không cần sửa)
- [RealtimeTransportModule](./apps/chat/src/modules/realtime-transport/realtime-transport.module.ts) - DI Container
- [main.tsx](./apps/chat/src/main.tsx) - App entry point (khởi tạo ở đây)
- [QUICKSTART.md](./apps/chat/src/modules/realtime-transport/QUICKSTART.md) - Integration guide
