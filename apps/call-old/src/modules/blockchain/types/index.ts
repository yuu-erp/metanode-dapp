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
  roomId: string
  _sdpOffer: string
  _initialTracks: ReqTrack[]
}

export type ReqEmitEventToBackend = {
  _roomId: string
  _sessionId: string
  _eventType: string
  _data: string
}

export type ReqLeaveRoom = {
  requestId: string
  roomId: string
  sessionId: string
  otherParty: string
  end: boolean
}
