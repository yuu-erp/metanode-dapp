export interface CreateRoomInput {
  name: string
  receiver: string
  meet: boolean
}

export interface Track {
  trackName: string
  mid: string
  streamNumber: number
  location: string
  isPublished: boolean
  sessionId: string
  roomId: string
}

export interface JoinRoomInput {
  _roomId: string
  _sessionLocal: string
  _participantName: string
  _sdpOffer: string
  _initialTracks: Track[]
}

export interface EmitEventToBackendInput {
  roomId: string
  sessionId: string
  eventType: string
  data: string // bytes as hex string
}

export interface LeaveRoomInput {
  roomId: string
  sessionId: string
  otherParty: string
  end: boolean
  sender: string
}
