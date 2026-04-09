import { RawTrack } from '~/@types'

export function extractMidTrackArray(sdp: string): RawTrack[] {
  const sections = sdp.split('\nm=')
  const result: RawTrack[] = []

  sections.forEach((section) => {
    const midMatch = section.match(/a=mid:(\S+)/)
    const msidMatch = section.match(/a=msid:(\S+)\s+(\S+)/)

    if (midMatch) {
      result.push({
        mid: midMatch[1] ?? '',
        trackName: msidMatch ? (msidMatch[2] ?? '') : ''
      })
    }
  })

  return result
}
