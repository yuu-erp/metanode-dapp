# 📐 Realtime-Transport Architecture Guide

**Mục đích, Vị trí, Quy trình & Worker evaluation**

---

## 1️⃣ MỤC ĐÍCH CỦA REALTIME-TRANSPORT MODULE

### Core Purpose

```
RealtimeTransport Module
    ↓
Quản lý peer-to-peer connections
    ↓
Dùng cho real-time data transfer (files, streams, etc)
    ↓
Không phải cho messages (đó là blockchain)
```

### Cụ thể

| Aspect              | Details                                                |
| ------------------- | ------------------------------------------------------ |
| **Domain**          | P2P WebRTC Network Communication                       |
| **Technology**      | WebRTC DataChannels + Cloudflare Calls relay           |
| **Use Case**        | Fast direct file transfer between peers                |
| **Why needed**      | Messages dùng blockchain (slow), need fast P2P channel |
| **Responsibility**  | Session management + connection orchestration          |
| **NOT responsible** | Message storage, encryption, business logic            |

### Khác biệt

```
Message Module (blockchain-based)
├── Send message → Encrypt → On-chain storage
├── Slow (minutes)
├── Permanent record
└── Business logic

RealtimeTransport Module (P2P-based)
├── Send file/stream → Direct connection
├── Fast (seconds)
├── Temporary session
└── Infrastructure only
```

---

## 2️⃣ KIẾN TRÚC: FILE TRANSFER SẼ NẰM Ở MODULE NÀO?

### 📊 Khuyến nghị: Tạo module `file-transfer` riêng

```
modules/
├── realtime-transport/        ← Infrastructure (WebRTC P2P)
│   ├── SessionManager
│   ├── TransportService
│   ├── CloudflareAdapter
│   └── WebRTCAdapter
│
├── file-transfer/ ⭐ NEW      ← Business Logic (File handling)
│   ├── file-transfer.service.ts
│   ├── file-transfer.repository.ts  (IndexedDB persistence)
│   ├── file-transfer.type.ts
│   ├── chunks/                      (chunking strategy)
│   ├── workers/                     (heavy processing)
│   └── index.ts
│
├── message/                   ← Message blockchain logic
│   ├── message.service.ts
│   └── message.repository.ts
│
└── conversation/              ← Conversation logic
    └── conversation.service.ts
```

### Tại sao tách riêng?

```
✅ Single Responsibility:
  • realtime-transport: Quản lý sessions & connections
  • file-transfer: Quản lý file logic & chunking

✅ Testability:
  • Có thể test file-transfer riêng
  • Không phụ thuộc vào realtime-transport implementation

✅ Reusability:
  • File-transfer có thể dùng khác protocols
  • RealtimeTransport có thể dùng cho khác use cases

✅ Maintainability:
  • Dễ update mỗi module độc lập
  • Clear boundaries
```

### Phân công trách nhiệm

```
┌─────────────────────────────────────────────────┐
│ Components (UI)                                 │
│ ├─ FileUploader                                │
│ └─ FileReceiver                                │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ file-transfer Module (Business Logic)           │
│ ├─ FileTransferService                         │
│ │   ├─ prepareFile()                          │
│ │   ├─ chunkFile()                            │
│ │   ├─ calculateChecksum()                    │
│ │   └─ validateFile()                         │
│ ├─ FileChunker                                │
│ │   ├─ split chunks                          │
│ │   └─ manage retries                        │
│ └─ FileMetadataRepository                     │
│     └─ persist to IndexedDB                   │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ realtime-transport Module (Infrastructure)      │
│ ├─ SessionManager                              │
│ ├─ TransportService                            │
│ ├─ DataChannels                                │
│ └─ WebRTC Connection                           │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│ External APIs                                   │
│ ├─ Cloudflare Calls                            │
│ └─ Browser WebRTC API                          │
└─────────────────────────────────────────────────┘
```

---

## 3️⃣ QUY TRÌNH ÁP DỤNG REALTIME-TRANSPORT - CỦA HỢPN

### A. Setup Phase (Tuần 1)

```
Step 1: Setup environment
├─ Add Cloudflare credentials to .env
├─ Configure ICE servers
└─ Test connectivity

Step 2: Initialize realtime-transport
├─ Update main.tsx
├─ Create useRealtimeTransport hook
└─ Test SessionManager

Step 3: Create file-transfer module
├─ FileTransferService
├─ FileChunker
├─ FileMetadataRepository
└─ Types
```

### B. Integration Phase (Tuần 2-3)

```
Step 1: Create FileUploader component
├─ Select file
├─ Call FileTransferService.prepareFile()
├─ Create realtime session
└─ Start transfer

Step 2: Setup chunking
├─ Split file into chunks (16KB each)
├─ Monitor progress
├─ Handle retries
└─ Validate checksums

Step 3: Create FileReceiver component
├─ Listen for incoming sessions
├─ Receive chunks
├─ Assemble file
├─ Save to IndexedDB
└─ Trigger download
```

### C. Data Flow (Chi tiết)

```
Sender:
1. User selects file
   ↓
2. FileUploadComponent.onFileSelect()
   ↓
3. FileTransferService.prepareFile()
   ├─ Validate file (size, type)
   ├─ Calculate checksum
   └─ Chunk file (16KB chunks)
   ↓
4. useRealtimeTransport() hook
   ├─ Create session via SessionManager
   ├─ Get RTCDataChannel
   └─ Setup event listeners
   ↓
5. FileChunker.sendChunks()
   ├─ For each chunk:
   │  ├─ Send chunk data
   │  ├─ Monitor bufferedAmount
   │  ├─ Implement backpressure
   │  └─ Handle retries
   └─ Send final checksum
   ↓
6. Notify completion
   ├─ Close data channel
   ├─ Close session
   └─ Show success message

Receiver:
1. Notification of incoming session
   ↓
2. FileReceiverComponent.onSessionStart()
   ↓
3. useRealtimeTransport() hook
   ├─ Accept session
   └─ Setup data channel listener
   ↓
4. Receive chunks via onMessage()
   ├─ Buffer chunks
   ├─ Update progress
   ├─ Handle out-of-order
   └─ Validate checksum
   ↓
5. FileTransferService.assembleFile()
   ├─ Combine chunks
   ├─ Create Blob
   └─ Save to IndexedDB
   ↓
6. Show download / open options
```

### D. Module Interaction

```
FileTransferService
├─ Uses: realtime-transport (SessionManager)
├─ Uses: FileChunker (splitting logic)
├─ Uses: FileMetadataRepository (persistence)
└─ Does NOT care: WebRTC, Cloudflare details

FileChunker
├─ Responsibility: Split/combine chunks
├─ Size: Fixed 16KB (configurable)
├─ Retry: Exponential backoff
└─ Backpressure: Monitor bufferedAmount

useRealtimeTransport hook
├─ Manages: Session lifecycle
├─ Provides: SessionManager, TransportService
├─ Cleanup: Auto-close on unmount
└─ State: status, session, error

Components
├─ Call: FileTransferService (high-level)
├─ Call: useRealtimeTransport (connection)
├─ No direct: Adapter calls
└─ Concern: UI rendering only
```

---

## 4️⃣ ĐÁNH GIÁ: THÊM WORKER ĐỂ XỬ LÝ FILE

### Use Cases for Web Workers

```
CPU-intensive operations:
├─ File chunking (splitting large files)
├─ Checksum calculation (hashing)
├─ Compression/decompression
├─ Encryption/decryption
└─ Image resizing

I/O operations:
├─ Reading large files
├─ Writing to IndexedDB
└─ JSON parsing (huge JSONs)

Long-running tasks:
├─ Progress tracking
├─ Retry logic
└─ Connection monitoring
```

### Worker Architecture

```
Main Thread (UI)
├─ File selection
├─ UI rendering
├─ User interactions
└─ Lightweight tasks

Worker Thread(s)
├─ File processing
├─ Chunk generation
├─ Checksum calculation
├─ Encryption
└─ IndexedDB writes
```

### 📊 Pros & Cons

#### ✅ **Ưu điểm của Worker**

| Benefit                 | Impact                                        |
| ----------------------- | --------------------------------------------- |
| **Non-blocking UI**     | ✅ Smooth interactions while processing files |
| **Performance**         | ✅ Large files won't freeze app               |
| **CPU-intensive**       | ✅ Hashing/encryption offloaded               |
| **Progress tracking**   | ✅ Can update UI during processing            |
| **Parallel processing** | ✅ Multiple files simultaneously              |

#### ⚠️ **Nhược điểm của Worker**

| Drawback                       | Impact                               |
| ------------------------------ | ------------------------------------ |
| **Complexity**                 | ⚠️ Message passing, debugging harder |
| **Overhead**                   | ⚠️ Creation cost (~3-5ms per worker) |
| **Memory**                     | ⚠️ Separate heap, duplication        |
| **Learning curve**             | ⚠️ Team needs training               |
| **Not needed for small files** | ⚠️ Overkill if mostly < 10MB         |

### 🎯 KHUYẾN NGHỊ

#### **Phase 1: Không cần worker** (MVP)

```
File size: < 100MB
Chunking: Inline (main thread)
Encryption: Optional (later)
Compression: No

Reason:
• Browser APIs đủ nhanh cho file < 100MB
• Chunking 16KB pieces là trivial
• Overhead of worker > benefit

Timeline: Week 1-2
```

#### **Phase 2: Add worker sau** (v1.1)

```
When to add:
• File size > 100MB frequently
• Want smooth UI for large files
• Need encryption/compression
• Performance metrics show bottleneck

Worker responsibility:
├─ File chunking
├─ Checksum calculation
├─ Encryption (if needed)
└─ IndexedDB writes

Main thread:
├─ UI updates
├─ Session management
├─ Data channel sends
└─ Progress display

Timeline: Week 3-4 (optimize later)
```

### Example Worker Usage

```ts
// file-transfer.worker.ts (Web Worker)
self.onmessage = async (event) => {
  const { type, file, chunkSize } = event.data

  if (type === 'chunk-file') {
    const chunks = []
    for (let i = 0; i < file.size; i += chunkSize) {
      const chunk = file.slice(i, i + chunkSize)
      chunks.push(chunk)
    }
    self.postMessage({ type: 'chunks-ready', chunks })
  }

  if (type === 'calculate-checksum') {
    const buffer = await file.arrayBuffer()
    const hash = await crypto.subtle.digest('SHA-256', buffer)
    self.postMessage({ type: 'checksum-ready', hash })
  }
}

// In FileTransferService
const worker = new Worker('file-transfer.worker.ts')
worker.postMessage({ type: 'chunk-file', file, chunkSize: 16384 })
worker.onmessage = (event) => {
  if (event.data.type === 'chunks-ready') {
    const chunks = event.data.chunks
    // Process chunks...
  }
}
```

---

## 5️⃣ RECOMMENDED ARCHITECTURE

### Phase 1: MVP (Week 1-2) - No Worker

```
file-transfer/
├── file-transfer.service.ts
│   ├─ prepareFile()
│   ├─ chunkFile() ← main thread
│   ├─ calculateChecksum() ← main thread
│   └─ validateFile()
├── file-chunker.ts
│   ├─ split(file, chunkSize)
│   ├─ combine(chunks)
│   └─ retry logic
├── file-transfer.repository.ts
│   └─ IndexedDB operations
└── file-transfer.type.ts

realtime-transport/
└─ (unchanged, already ready)

Components/
├── FileUploader.tsx
├── FileReceiver.tsx
├── FileProgress.tsx
└── useRealtimeTransport() hook
```

**Effort:** ~3-4 days  
**Complexity:** Low  
**Performance:** Acceptable for MVP

### Phase 2: Optimized (Week 3+) - With Worker

```
file-transfer/
├── file-transfer.service.ts
│   ├─ prepareFile()
│   ├─ chunkFile() ← delegate to worker
│   ├─ calculateChecksum() ← delegate to worker
│   └─ validateFile()
├── file-chunker.ts
│   ├─ Main thread coordinator
│   └─ Message passing to worker
├── workers/
│   └── file-transfer.worker.ts ⭐ NEW
│       ├─ Chunking logic
│       ├─ Hashing logic
│       └─ Encryption (future)
├── file-transfer.repository.ts
└── file-transfer.type.ts

realtime-transport/
└─ (unchanged)

Components/
├── FileUploader.tsx
├── FileReceiver.tsx
├── FileProgress.tsx
└── useRealtimeTransport() hook
```

**Effort:** +2-3 days  
**When:** After MVP, if needed  
**Performance:** Much smoother for large files

---

## 6️⃣ IMPLEMENTATION CHECKLIST

### Prerequisites

- [ ] realtime-transport module ready (✅ done)
- [ ] main.tsx updated (✅ done)
- [ ] useRealtimeTransport hook created

### Phase 1: File Transfer Module (MVP)

- [ ] Create `modules/file-transfer/` folder
- [ ] Implement FileTransferService
- [ ] Implement FileChunker
- [ ] Implement FileMetadataRepository
- [ ] Create types
- [ ] Create index.ts

### Phase 2: Integration

- [ ] Create FileUploader component
- [ ] Create FileReceiver component
- [ ] Create FileProgress component
- [ ] Setup session management
- [ ] Handle data channel events

### Phase 3: Testing

- [ ] Unit tests (FileChunker, etc)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests (< 100MB)

### Phase 4: Optimization (Later)

- [ ] Add Web Worker if needed
- [ ] Add compression (optional)
- [ ] Add encryption (optional)
- [ ] Performance monitoring

---

## 7️⃣ KEY TAKEAWAYS

| Topic                          | Decision                                 |
| ------------------------------ | ---------------------------------------- |
| **realtime-transport purpose** | Infrastructure for P2P connections       |
| **File transfer location**     | New `file-transfer` module               |
| **Worker needed?**             | No (Phase 1), Yes (Phase 2+)             |
| **When to add worker**         | If frequently > 100MB files              |
| **Implementation timeline**    | MVP 3-4 days, Optimized +2-3 days        |
| **Architecture**               | Layered (UI → Business → Infrastructure) |

---

## 📚 Related Docs

- [realtime-transport README](./README.md)
- [SETUP_IN_MAIN.md](./SETUP_IN_MAIN.md)
- [STRUCTURE.md](./STRUCTURE.md)

---

**Next:** Create `file-transfer` module based on this architecture
