import type { ReqTrack } from '../blockchain/types'

export type MeetingViewInput = {
  caller: string
  callee: string
  isMeet: boolean
  isCaller: boolean
  address: string
  roomId?: string
  sessionId?: string
  sdp_offer?: string
}

export type ReqSdpAnswer = {
  ToUser: string
  AnswerSDP: string
}

export type ReqAddTrack = {
  Track: ReqTrack[]
}

export type JoinAnswerData = {
  sessionDescription: RTCSessionDescriptionInit
  sessionId: string
}

export type PullTrackFromNewPersonJoinData = {
  sessionDescription: RTCSessionDescriptionInit
  requiresImmediateRenegotiation: boolean
  sessionId: string
  sourceUser: string
}
