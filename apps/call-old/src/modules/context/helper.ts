export const ICE_SERVERS =
  // ['stun:stun2.l.google.com:19302']
  ['stun:stun.cloudflare.com:3478']

export function createPeerConnection() {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS.map((item) => ({ urls: item })),
    bundlePolicy: 'balanced'
  })
}
