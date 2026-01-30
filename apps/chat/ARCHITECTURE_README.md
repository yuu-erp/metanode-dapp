# 🧱 Project Architecture -- Chat Blockchain App

> Mục tiêu: - Tách biệt **UI (Features)** -- **Business (Modules)** -- **Infra** - Dễ mở rộng, dễ test - Dev mới đọc là hiểu luồng hệ thống

---

## 1️⃣ Tổng quan kiến trúc

Ứng dụng được xây dựng theo **Domain-driven + Layered Architecture** (Vertical Slice hybrid).

```text
UI (Features)  →  Context / Hooks
       ↓
Services (Modules)
       ↓
Infra (Blockchain / Storage)
```

### ❗ Quy tắc cứng

- **UI (Features)**: Chỉ chứa React logic (Components, Contexts, Hooks). KHÔNG chứa business logic phức tạp.
- **Modules**: Pure Typescript. KHÔNG import React. Chứa Entities, Use Cases (Services), Repositories.
- **Dependency Rule**: `Features` -> `Modules` -> `Infra`. Không bao giờ ngược lại.

---

## 2️⃣ Cấu trúc thư mục

```text
src/
├─ app/              # App setup
├─ routes/           # File-based routing (Glue layer)
├─ modules/          # 🧠 CORE DOMAIN (Pure TS)
│  ├─ account/
│  ├─ wallet/
│  ├─ conversation/  # Domain logic chat
│  ├─ message/       # Domain logic message
│  └─ ...
├─ features/         # 🎨 UI FEATURES (React)
│  ├─ message/       # Components, Contexts hiển thị message
│  ├─ conversation/  # Components list chat
│  ├─ wallet/        # UI ví
│  └─ ...
├─ shared/           # Dumb components, utils dùng chung
└─ container.ts      # 💉 Dependency Injection Root
```

---

## 3️⃣ Giải thích các layer

### 🎨 features/ (UI Layer)

- **Quy tắc đặt tên**: Số ít (Singular). Ví dụ: `message`, `wallet`.
- Chứa:
  - `components/`: React components thực hiện rendering.
  - `contexts/`: React Context để giữ UI state (không phải Business State).
  - `hooks/`: Custom hooks gọi xuống Service.

### 🧠 modules/ (Domain Layer)

- Chứa **Nghiệp vụ cốt lõi**.
- **Tuyệt đối không import React/ReactDOM**.
- Để có thể tái sử dụng cho Mobile (React Native) hoặc Backend (NodeJS) nếu cần.
- Cấu trúc:
  - `*.entity.ts`: Định nghĩa dữ liệu.
  - `*.service.ts`: Logic nghiệp vụ.
  - `*.repository.ts`: Interface giao tiếp dữ liệu.

### 💉 container.ts (Composition Root)

- Nơi duy nhất khởi tạo các class Service/Repository.
- Các Feature sẽ import `container` để lấy instance của Service.

---

## 4️⃣ Quy trình phát triển (Flow)

1.  **Define Domain**: Tạo `modules/abc`. Viết Entity, Service.
2.  **Register Container**: Đăng ký Service vào `src/container.ts`.
3.  **Build UI**: Tạo `features/abc`. Viết Component, Hook.
4.  **Connect**: Hook gọi `container.abcService`.

---

> ❝ Code có thể sửa, kiến trúc sai thì rewrite ❞
