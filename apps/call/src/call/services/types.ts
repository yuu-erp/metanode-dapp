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
  tracks: {
    track: { location: string; mid: string; trackName: string }
    user: string
  }[]
  index: number
  total: number
}

export type PullTrackWhenNewPersonJoinData = {
  sessionDescription: string
  sessionId: string
  sourceUser: string
  tracks: { location: string; mid: string; trackName: string }[]
  index: number
  total: number
}
