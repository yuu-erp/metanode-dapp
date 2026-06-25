type MediaDirection = 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive'

export type SdpMedia = {
  mid: string
  kind: string
  direction?: MediaDirection
}

export function parseSdpMedia(sdp: string): SdpMedia[] {
  const lines = sdp
    .split(/\r\n|\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const result: SdpMedia[] = []

  let current: Partial<SdpMedia> | null = null

  const pushCurrent = () => {
    if (current?.kind && current?.mid) {
      result.push({
        kind: current.kind,
        mid: current.mid,
        direction: current.direction
      })
    }
  }

  for (const line of lines) {
    if (line.startsWith('m=')) {
      // kết thúc media section cũ
      pushCurrent()

      // bắt đầu media section mới
      const mParts = line.slice(2).split(/\s+/)
      current = {
        kind: mParts[0] // audio / video / application
      }
      continue
    }

    if (!current || !line.startsWith('a=')) continue

    const value = line.slice(2)

    if (value.startsWith('mid:')) {
      current.mid = value.slice(4)
      continue
    }

    if (
      value === 'sendrecv' ||
      value === 'sendonly' ||
      value === 'recvonly' ||
      value === 'inactive'
    ) {
      current.direction = value
      continue
    }
  }

  // push section cuối
  pushCurrent()

  return result
}
