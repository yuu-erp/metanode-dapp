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
