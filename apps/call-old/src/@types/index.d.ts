export {}
declare global {
  interface Window {
    finSdk: any
    isHasNotch?: boolean
  }

  type ReqTrack = {
    trackName: string
    mid: any
    location: string
    streamNumber: number
    isPublished: boolean
    roomId: string
  }

  type ConnectionType = 'local' | 'remote'
  type ConnectionStatus = 'idle' | 'connecting' | 'success' | 'failed'
}
