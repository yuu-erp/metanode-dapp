export type UserSource = 'camera' | 'microphone'

export type Source = UserSource | 'screen' | 'systemAudio'

export type StreamSource = 'user' | 'display'

export type RawTrack = {
  trackName: string
  mid: string
}

export type FrontendEventType =
  | 'JOIN_ANSWER'
  | 'PULL_TRACK_FROM_NEW_PERSON_JOIN'
  | 'PULL_TRACK_WHEN_ME_JOIN'
