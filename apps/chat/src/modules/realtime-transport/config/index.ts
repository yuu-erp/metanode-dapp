export const cloudflareConfig = {
  appID: import.meta.env.VITE_CLOUDFLARE_APP_ID || '3c4d5c9fb2cc47a390100b31e579b4fb',
  appToken:
    import.meta.env.VITE_CLOUDFLARE_APP_TOKEN ||
    'c5675b0e44c5003f9de0491af5da5d84e953129c7cfcd7f6081bf357b6176057',
  apiBase:
    import.meta.env.VITE_CLOUDFLARE_API_BASE ||
    'https://rtc.live.cloudflare.com/v1/apps/3c4d5c9fb2cc47a390100b31e579b4fb'
}

export const webrtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
}
