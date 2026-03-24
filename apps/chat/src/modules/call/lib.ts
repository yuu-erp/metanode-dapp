import { formatAddress } from '@/shared/utils'

export const ICE_SERVERS = ['stun:stun.cloudflare.com:3478']

export function hexToString(hex: string): string {
  // bỏ khoảng trắng nếu có
  hex = hex.replace(/\s+/g, '')

  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16))
  }

  return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
}

export function stringToHex(str: any): string {
  const bytes = new TextEncoder().encode(str) // chuyển string thành Uint8Array
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0')) // mỗi byte -> hex 2 ký tự
    .join('')
}

export function encodeDataToBackend(data: any) {
  return stringToHex(JSON.stringify(data))
}

export function decodeDataFromBackend(data: string) {
  try {
    return JSON.parse(hexToString(data))
  } catch (error) {
    throw error
  }
}

export function compareAddress(add1: string, add2: string) {
  return formatAddress(add1) === formatAddress(add2)
}

export function extractMidTrackArray(sdp: string): {
  trackName: string
  mid: string
}[] {
  const sections = sdp.split('\nm=')
  const result: { mid: string; trackName: string }[] = []

  sections.forEach((section) => {
    const midMatch = section.match(/a=mid:(\S+)/)
    const msidMatch = section.match(/a=msid:[^\s]+\s+([^\s]+)/)

    if (midMatch) {
      result.push({
        mid: midMatch[1],
        trackName: msidMatch ? msidMatch[1] : ''
      })
    }
  })

  return result
}

export function createPeerConnection() {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS.map((item) => ({ urls: item })),
    bundlePolicy: 'balanced'
  })
}

export function randomBytes32(): string {
  let result = '0x'

  for (let i = 0; i < 32; i++) {
    const byte = Math.floor(Math.random() * 256)
    result += byte.toString(16).padStart(2, '0')
  }

  return result
}
