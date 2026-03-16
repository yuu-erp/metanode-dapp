export const ICE_SERVERS =
  // ['stun:stun2.l.google.com:19302']
  ['stun:stun.cloudflare.com:3478']

export function createPeerConnection() {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS.map((item) => ({ urls: item })),
    bundlePolicy: 'balanced'
  })
}

export function extractMidTrackArray(sdp: string): {
  trackName: string
  mid: string
}[] {
  const sections = sdp.split('\nm=') // tách theo từng media section
  const result: { mid: string; trackName: string }[] = []

  sections.forEach((section) => {
    const midMatch = section.match(/a=mid:(\S+)/)
    const msidMatch = section.match(/a=msid:[^\s]+\s+([^\s]+)/)

    if (midMatch) {
      result.push({
        mid: midMatch[1],
        trackName: msidMatch ? msidMatch[1] : '' // nếu không có msid thì để rỗng
      })
    }
  })

  return result
}
