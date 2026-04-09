export type CreateRoomRequest = {
  _receiver: string
  roomName: string
  meet: boolean
  isLockRoom: boolean
  owner: string
}

export type TrackRequest = {
  trackName: string
  mid: string
  location: string
  streamNumber: number
  isPublished: boolean
  roomId: string
}

export type JoinRoomRequest = {
  roomId: string
  _initialTracks: TrackRequest[]
  _sdpOffer: string
  owner: string
}

export type EmitEventToBackendRequest = {
  _roomId: string
  _sessionId: string
  _eventType: string
  _data: string
}

export type WithRoomId = {
  roomId: string
}

export type RejectCallRequest = {
  _caller: string
  _roomId: string
  owner: string
}

export type LeaveRoomRequest = {
  roomId: string
  sender: string
  otherParty: string
  end: boolean
  meet: boolean
  owner: string
}

export type SendCallReactionRequest = {
  roomId: string
  _reaction: string
  owner: string
}

export type HandleRaiseHandRequest = {
  roomId: string
  _isRaiseHand: boolean
  owner: string
}

export type ParticipantActionRequest = {
  roomId: string
  _participant: string
}
