# Architecture Design: Cyber Game

> **Role**: Frontend Architect
> **Status**: UI PHASE (Priority)

## 1. Overview

**Cyber Game** là một ứng dụng **Game Launcher** & **Management System** phục vụ đa đối tượng.
Giai đoạn này tập trung hoàn toàn vào **UI/UX Layer**, chưa triển khai Complex Business Logic.

## 2. UI Architecture Strategy

Chúng ta sẽ tập trung vào lớp UI trước, đảm bảo trải nghiệm người dùng mượt mà và nhất quán.

### 2.1. Phân loại Interface

Hệ thống có 3 loại giao diện chính với yêu cầu khác biệt:

1.  **Immersive UI (Game Launcher)**
    - **Target**: Gamers.
    - **Characteristics**: Full-screen, High visual impact, Animation-heavy, Dark/Neon theme.
    - **Components**: Custom, highly styled components.

2.  **Dashboard UI (Management System)**
    - **Target**: Owners, Managers.
    - **Characteristics**: Data-dense, Clean, Grid-based, Light/Dark mode support.
    - **Components**: Standard Admin UI (Tables, Charts, Forms) -> Sử dụng **Shadcn UI**.

3.  **Operational UI (Staff Tools)**
    - **Target**: Staff.
    - **Characteristics**: Touch-friendly (optional), High contrast, Action-oriented.
    - **Components**: Large buttons, clear indicators.

### 2.2. Directory Structure (UI Focused)

```
apps/cyber-game/src/
├── app/                  # Providers, Global CSS
├── assets/               # Static assets
├── components/           # REUSABLE COMPONENTS
│   ├── ui/               # Base Atomic Components (Shadcn/Radix) - SHARED
│   ├── common/           # Complex Shared Components (UserAvatar, Logo)
│   ├── launcher/         # Components specific to Launcher Flow (GameCard, Hero)
│   └── management/       # Components specific to Admin Dashboard (RevenueChart)
├── layouts/              # LAYOUT DEFINITIONS
│   ├── auth-layout.tsx   # Login/Register wrapper
│   ├── launcher-layout.tsx # Navbar, Sidebar for Gamers
│   └── admin-layout.tsx  # Sidebar, Header for Owners
└── theme/                # Design Tokens, Tailwind Config
```

## 3. Technology Stack (UI)

- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS v4
- **Component Primitives**: Radix UI
- **Component Library**: Shadcn UI (for Dashboard/Admin)
- **Icons**: Lucide React
- **Animation**: Framer Motion (cho Launcher effects)
- **Routing**: TanStack Router

## 4. Deferred Modules (Planned)

Các modules sau sẽ được phát triển sau khi UI ổn định:

- `modules/auth`
- `modules/launcher` (Logic interaction)
- `modules/management` (Logic data)

## 5. Next Steps (UI Phase)

1.  **Setup Styling**: Configure Tailwind v4, Fonts, Colors (Neon vs Corporate).
2.  **Base Components**: Install Shadcn UI core.
3.  **Layout Implementation**: Create 3 core layouts (Launcher, Admin, Auth).
4.  **Route Integration**: Map routes to layouts.
