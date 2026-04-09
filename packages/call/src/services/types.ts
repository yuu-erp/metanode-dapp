export type JoinAnswerData = {
  sessionId: string
  index: string
  total: string
  sdp: string
}

export type PullTrackData = {
  sessionDescription: string
  sessionId: string
  sourceUser: string
  tracks: { location: string; mid: string; trackName: string }[]
  index: number
  total: number
}
