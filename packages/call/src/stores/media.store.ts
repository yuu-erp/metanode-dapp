import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Source } from '~/@types'
import { toStreamKey } from '~/utils'

type StreamEntity = {
  stream?: MediaStream
  mids?: string[] // optional cho local
}

export type MediaState = {
  streams: Record<string, StreamEntity>
  midToStreamKeys: Record<string, string>
  localTracks: Record<Source, MediaStreamTrack | null>
}

export type MediaActions = {
  setMidToStreamKey: (mid: string, streamKey: string) => void
  setStreamMids: (streamKey: string, mids: string[]) => void
  setLocalTrack: (source: Source, track: MediaStreamTrack | null) => void
  removeUser: (user: string) => void
  setStream: (streamKey: string, stream: MediaStream) => void
  reset: () => void
}

export type MediaStore = MediaState & MediaActions

export const mediaStore = create<MediaStore>()(
  immer((set) => ({
    streams: {},
    midToStreamKeys: {},
    localTracks: { camera: null, microphone: null, screen: null, systemAudio: null },
    reset: () => {
      set((s) => {
        // 1. STOP local tracks (QUAN TRỌNG)
        Object.values(s.localTracks).forEach((track) => {
          try {
            track?.stop?.()
          } catch {}
        })

        // 2. clear streams (KHÔNG stop ở đây)
        s.streams = {}

        // 3. clear mapping
        s.midToStreamKeys = {}

        // 4. reset local tracks
        s.localTracks = {
          camera: null,
          microphone: null,
          screen: null,
          systemAudio: null
        }
      })
    },
    setStream: (streamKey, stream) => {
      set((s) => {
        if (!s.streams[streamKey]) {
          s.streams[streamKey] = {}
        }

        s.streams[streamKey].stream = stream
      })
    },
    removeUser: (user) => {
      set((s) => {
        const userKey = toStreamKey(user, 'user')
        const displayKey = toStreamKey(user, 'display')
        s.streams[userKey]?.mids?.forEach((mid) => {
          delete s.midToStreamKeys[mid]
        })
        s.streams[displayKey]?.mids?.forEach((mid) => {
          delete s.midToStreamKeys[mid]
        })
        delete s.streams[userKey]
        delete s.streams[displayKey]
      })
    },
    setLocalTrack: (source, track) => {
      set((s) => {
        s.localTracks[source] = track
      })
    },
    setStreamMids: (streamKey, mids) => {
      set((s) => {
        if (!s.streams[streamKey]) {
          s.streams[streamKey] = {}
        }

        s.streams[streamKey].mids = mids

        mids.forEach((mid) => {
          s.midToStreamKeys[mid] = streamKey
        })
      })
    },
    setMidToStreamKey: (mid, streamKey) => {
      set((s) => {
        s.midToStreamKeys[mid] = streamKey
      })
    }
  }))
)

export const useMediaStore = mediaStore

export const mediaActions = mediaStore.getState() as MediaActions
