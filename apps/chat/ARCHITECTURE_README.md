# 🧱 Project Architecture -- Chat Blockchain App

> Mục tiêu: - Tách biệt **UI -- Business -- Infra** - Dễ mở rộng, dễ
> test - Dev mới đọc là hiểu luồng hệ thống

---

## 1️⃣ Tổng quan kiến trúc

Ứng dụng được xây dựng theo **Domain-driven + Layered Architecture**

```text
UI / Routes
   ↓
Hooks (Orchestration)
   ↓
Services (Business logic)
   ↓
Infra (Blockchain / Wallet / Storage)
```

### ❗ Quy tắc cứng

- UI **không gọi trực tiếp** blockchain / IndexedDB
- Service **không phụ thuộc React**
- Infra **không import ngược lên**
- Không circular dependency

---

## 2️⃣ Cấu trúc thư mục

```text
src/
├─ app/
├─ routes/
├─ modules/
│  ├─ account/
│  ├─ wallet/
│  ├─ chat/
│  ├─ message/
│  ├─ contact/
│  ├─ presence/
│  ├─ sync/
│  └─ system/
├─ shared/
│  ├─ ui/
│  ├─ layouts/
│  ├─ hooks/
│  └─ utils/
└─ assets/
```

---

## 3️⃣ Giải thích các layer

### 🧠 modules/ (Core Business)

- Mỗi thư mục = 1 domain
- Không import UI
- Không Tailwind
- Có thể test độc lập

### 🎨 shared/ui/

- UI thuần
- Không xử lý nghiệp vụ

### 🧭 routes/

- File-based routing
- Layout, guard, gọi hook
- Không xử lý business logic

---

## 4️⃣ Phân cấp domain (Dependency Direction)

```text
Infra
  ↓
Core Domains
  ↓
Coordination
  ↓
UI / Routes
```

---

## 5️⃣ Quy tắc import

### ✅ Đúng

```ts
import type { Account } from '@/modules/account/types'
```

### ❌ Sai

```ts
import { useWallet } from '@/modules/wallet'
```

---

## 6️⃣ Quy ước code

```text
*.service.ts     # Business logic
*.repo.ts        # Storage
*.contract.ts    # Blockchain
*.store.ts       # State
use*.ts          # Hook
```

---

## 7️⃣ ESLint & kiến trúc

- Chặn import sai hướng
- Chặn vòng lặp
- Enforce type-only import

---

## 8️⃣ Mục tiêu dài hạn

- Multi-account (Telegram-style)
- Offline-first
- On-chain sync
- Multi-chain
- Scale mobile / desktop

---

> ❝ Code có thể sửa, kiến trúc sai thì rewrite ❞
