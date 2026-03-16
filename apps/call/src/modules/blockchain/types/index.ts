export interface TransactionPayload<T = unknown> {
  from: string
  to?: string
  inputData?: T
}

export type ReqTrack = {
  trackName: string
  mid: any
  location: string
  streamNumber: number
  isPublished: boolean
  roomId: string
}

export type ReqJoinRoom = {
  requestId: string
  roomId: string
  sessionId: string
  _sdpOffer: string
  _initialTracks: ReqTrack[]
}

export type ReqEmitEventToBackend = {
  _roomId: string
  _sessionId: string
  _eventType: string
  _data: string
}
