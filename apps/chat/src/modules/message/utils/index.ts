import { SystemCore } from '@metanodejs/system-core'

export function encodeBase64(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

export function decodeBase64(base64: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

export async function computeFileHash(file: File) {
  const arrayBuffer = await file.arrayBuffer()

  const rs = await SystemCore.sendWeb({
    command: 'createHashFromArrayBuffer',
    value: arrayBuffer
  })
  console.log('hash rs', rs)
  return rs?.data?.hash as string
}
