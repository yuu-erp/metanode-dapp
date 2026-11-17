# Pure manual test (HTML + JS)

Trang tĩnh để test tay theo **19 domain** (chỉ phần đã implement) — **toàn bộ code nằm trong `apps/chat/pure/`**, không dùng `src/pure-test`.

**Chỉ dùng khi dev** — không build, không đưa vào `dist/` (Vite build chỉ bundle `index.html` app; plugin chặn mọi file trong `pure/`).

## Mở trang

```bash
pnpm -F chat dev
# → http://localhost:3000/pure/index.html
```

Entry: `entry.js` → `run.ts`. Boot: `await bootstrapFinSdk()` (gọi `FiaiSDK.init({})` rồi `initFileReact`) **trước** khi mount domain Wallet — `window.fiaiSDK` chỉ có sau init.

## Cấu trúc

| File                                               | Vai trò                                                     |
| -------------------------------------------------- | ----------------------------------------------------------- |
| `index.html`                                       | Layout + CSS                                                |
| `entry.js`                                         | Entry module (JS)                                           |
| `run.ts`                                           | Boot fiaiSDK + render domain                                |
| `domains/wallet-account.ts`                        | Domain 1: ví + user contract                                |
| `domains/conversation.ts`                          | Domain 2: inbox on-chain (`getFullInboxPaginatedOptimized`) |
| `utils/fetch-conversation-list.ts`                 | Gọi contract inbox (reuse `container.userContract`)         |
| `domains/message.ts`                               | Domain 3: inbox → type → getProcessed\* messages            |
| `domains/send-message.ts`                          | Domain 4: gửi text (encrypt + send contract)                |
| `domains/send-file-message.ts`                     | Domain 5: chọn file → upload → gửi file message             |
| `utils/upload-file-pure.ts`                        | Upload + public status (`upload-files-for-send`)            |
| `domains/group.ts`                                 | Domain 6–10: create / member / admin                        |
| `utils/group-actions-pure.ts`                      | `conversationService` + group contract                      |
| `utils/fetch-group-snapshot.ts`                    | Group info + members sau mỗi action                         |
| `domains/call-meeting.ts`                          | Domain 11–15: call / meeting (5 panel riêng)                |
| `domains/message-pin-react.ts`                     | Domain 16–19: pin / unpin / react / unreact                 |
| `utils/message-pin-react-pure.ts`                  | Luồng `pin-message.ts` + `react-message.ts`                 |
| `e2e/pure-e2e-runner.ts`                           | Nút “Chạy full E2E” — 2 ví, event log, pass/fail từng bước  |
| `utils/call-meeting-pure.ts`                       | createRoom, rooms, reject, MeetingViewInput                 |
| `utils/send-message-pure.ts`                       | Luồng `send-message-v4` / `crypto-message` cho pure         |
| `utils/fetch-messages-by-conversation.ts`          | p2p / group / anonymous ABI (theo `list-mesage.ts`)         |
| `utils/resolve-conversation-target.ts`             | Match `conversationId` trong inbox                          |
| `utils/wallet-identity.ts`                         | Phân loại PK / address / random → ví                        |
| `utils/apply-pure-chat-identity.ts`                | setFrom + resolve user contract                             |
| `register-chat-user-skip-delegate.ts`              | Đã đăng ký → lookup; chưa → register (bỏ delegate)          |
| `domains.ts`, `render-domains.ts`, `sdk-loader.ts` | Shell 19 domain                                             |

Import app: `@/container`, `@/config`, … (alias Vite → `src/`). `tsconfig` exclude `pure/` khỏi `tsc` build.
