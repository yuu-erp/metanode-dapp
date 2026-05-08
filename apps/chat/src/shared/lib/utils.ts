import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = 1000
): Promise<T | undefined> {
  return Promise.race([
    fn(),
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeoutMs))
  ])
}

export const getBooleanValue = (v: string | boolean) => {
  if (typeof v === 'boolean') return v
  if (typeof v !== 'string') return false
  if (v.startsWith('true')) return true
  if (v.startsWith('false')) return false
  return false
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return address.toLowerCase().replace(/^0x/, '')
}

export function compareAddress(add1: string, add2: string) {
  return formatAddress(add1) === formatAddress(add2)
}

export function base64ToFile(base64: string, fileName: string, mimeType?: string): File {
  const arr = base64.split(',')

  // Ưu tiên mimeType truyền vào, nếu không thì lấy từ base64
  const mime = mimeType || (arr[0].match(/:(.*?);/)?.[1] ?? '')

  const bstr = atob(arr[arr.length - 1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], fileName, { type: mime })
}

export function downloadFile({
  buffer,
  name,
  ext
}: {
  buffer: number[]
  name: string
  ext: string
}) {
  const uint8Array = new Uint8Array(buffer)
  const blob = new Blob([uint8Array], {
    type: 'application/octet-stream'
  })

  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.${ext}` // 👈 file name thật ở đây
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)

  return url
}

export type Mention = {
  id: string
  display: string
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Cùng quy tắc @display\\b với buildRawValue — dùng cho highlight trong ô nhập */
/** Token lưu trong DB / gửi lên chain: chỉ id, không kèm tên (tên có thể đổi). */
export function formatStoredMentionToken(id: string) {
  return `@(${id})`
}

export type MessageContentPart = { type: 'text'; value: string } | { type: 'mention'; id: string }

/**
 * Tách nội dung tin nhắn: text thường + mention.
 * Hỗ trợ `@(id)` (mới) và `@[tên](id)` (legacy).
 */
export function splitMessageContentWithMentions(text: string): MessageContentPart[] {
  const re = /@\(([^)]+)\)|@\[([^\]]*)\]\(([^)]+)\)/g
  const parts: MessageContentPart[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: 'text', value: text.slice(last, m.index) })
    }
    const id = m[1] ?? m[3]
    if (id) parts.push({ type: 'mention', id })
    last = m.index + m[0].length
  }
  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) })
  }
  return parts
}

export function getMentionHighlightSegments(
  text: string,
  mentions: Mention[]
): Array<{ text: string; highlight: boolean }> {
  if (!text) return []
  if (!mentions.length) return [{ text, highlight: false }]

  type Range = { start: number; end: number }
  const ranges: Range[] = []
  for (const m of mentions) {
    if (!m.display) continue
    const re = new RegExp(`@${escapeRegExp(m.display)}\\b`, 'g')
    let match: RegExpExecArray | null
    while ((match = re.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length })
    }
  }
  if (!ranges.length) return [{ text, highlight: false }]

  ranges.sort((a, b) => a.start - b.start || a.end - b.end)
  const merged: Range[] = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (!last || r.start >= last.end) merged.push({ ...r })
    else last.end = Math.max(last.end, r.end)
  }

  const segments: Array<{ text: string; highlight: boolean }> = []
  let i = 0
  for (const r of merged) {
    if (r.start > i) segments.push({ text: text.slice(i, r.start), highlight: false })
    segments.push({ text: text.slice(r.start, r.end), highlight: true })
    i = r.end
  }
  if (i < text.length) segments.push({ text: text.slice(i), highlight: false })
  return segments
}

export function buildRawValue(display: string, mentions: Mention[]) {
  let raw = display

  for (const m of mentions) {
    if (!m.display || !m.id) continue
    const regex = new RegExp(`@${escapeRegExp(m.display)}\\b`, 'g')
    raw = raw.replace(regex, formatStoredMentionToken(m.id))
  }

  return raw
}
