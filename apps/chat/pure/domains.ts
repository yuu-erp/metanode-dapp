export type PureDomain = {
  id: number
  title: string
  description: string
}

/** Chỉ domain đã có form / logic — không placeholder. */
export const DOMAINS: PureDomain[] = [
  { id: 1, title: 'Wallet & Account', description: 'Ví + user contract' },
  { id: 2, title: 'Conversation', description: 'Inbox on-chain' },
  { id: 3, title: 'Message', description: 'Danh sách tin nhắn' },
  { id: 4, title: 'Send Message', description: 'Gửi text' },
  { id: 5, title: 'Send File Message', description: 'Upload + gửi file' },
  { id: 6, title: 'Group — Create', description: 'Tạo group' },
  { id: 7, title: 'Group — Add member', description: 'Thêm member' },
  { id: 8, title: 'Group — Remove member', description: 'Xóa member' },
  { id: 9, title: 'Group — Transfer admin', description: 'Chuyển chủ nhóm' },
  { id: 10, title: 'Group — Info', description: 'Info + members' },
  { id: 11, title: 'Call — Meeting factory', description: 'Factory user / sync' },
  { id: 12, title: 'Call — Create room', description: 'createRoom + event' },
  { id: 13, title: 'Call — Room info', description: 'Room + participants' },
  { id: 14, title: 'Call — Launch params', description: 'Params mở /call' },
  { id: 15, title: 'Call — Reject', description: 'rejectCall' },
  { id: 16, title: 'Message — Pin', description: 'pinMessage on-chain' },
  { id: 17, title: 'Message — Unpin', description: 'unpinMessage' },
  { id: 18, title: 'Message — React', description: 'reactToMessage' },
  { id: 19, title: 'Message — Unreact', description: 'unReactToMessage' },
]
