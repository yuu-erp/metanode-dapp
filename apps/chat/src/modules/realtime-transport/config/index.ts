export const cloudflareConfig = {
  appID: import.meta.env.VITE_CLOUDFLARE_APP_ID || '',
  appToken: import.meta.env.VITE_CLOUDFLARE_APP_TOKEN || '',
  apiBase: import.meta.env.VITE_CLOUDFLARE_API_BASE || 'https://api.cloudflare.com'
}

export const webrtcConfig = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun1.l.google.com:19302'] }
  ]
}
