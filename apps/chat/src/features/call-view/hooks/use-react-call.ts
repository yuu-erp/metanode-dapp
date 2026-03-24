import { callStore, useCall } from '@/modules/call'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useEventBus } from './use-eventbus'

export function useReactCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const isLocalConnected = useRef(false)
  const [users, setUsers] = useState<string[]>([])
  const videosMap = useRef(new Map<string, HTMLVideoElement>())
  const midStreamsMap = useRef(
    new Map<
      string,
      {
        stream: MediaStream
        mids: string[]
      }
    >()
  )

  const pc = useCall((s) => s.localPc)

  useEventBus('call.update-mid-per-user', (e) => {
    const { user, mids } = e
    setUsers((prev) => (prev.includes(user) ? prev : [...prev, user]))
    const stream = new MediaStream()
    midStreamsMap.current.set(user, { stream, mids })
    const el = videosMap.current.get(user)
    if (!el) return
    el.srcObject = stream
    el.play().catch()
  })

  useEventBus('call.remove-user', (e) => {
    setUsers((prev) => prev.filter((user) => user !== e.user))
    midStreamsMap.current.delete(e.user)
    videosMap.current.delete(e.user)
  })

  const setStream = (ref: RefObject<HTMLVideoElement | null>, stream?: MediaStream) => {
    const el = ref.current
    if (!el || !stream) return

    if (el.srcObject !== stream) {
      el.srcObject = stream
    }

    el.play().catch(() => {})
  }

  useEffect(() => {
    if (!pc) return

    pc.addEventListener('track', (e) => {
      console.log('thanhduy - track data 1', e)
      console.log('thanhduy - track data 2', midStreamsMap.current)
      console.log('thanhduy - track data 2', midStreamsMap.current)

      const mid = e.transceiver.mid
      const track = e.track

      track.addEventListener('ended', () => {
        console.log('thanhduy - track ended')
      })

      track.addEventListener('mute', () => {
        console.log('thanhduy - track mute')
      })

      if (!mid) return
      for (const entry of midStreamsMap.current.values()) {
        if (entry.mids.includes(mid)) {
          entry.stream.addTrack(track)
        }
      }
    })
  }, [pc])

  useEffect(() => {
    if (!pc) return

    const localPc = pc

    const onLocalStateChage = () => {
      if (localPc.connectionState === 'connected' && !isLocalConnected.current) {
        isLocalConnected.current = true
        const stream = callStore.getState().localStream
        setStream(localVideoRef, stream)
      }
    }

    localPc.addEventListener('connectionstatechange', onLocalStateChage)

    return () => {
      localPc.removeEventListener('connectionstatechange', onLocalStateChage)
    }
  }, [pc])

  useEffect(() => {
    let lastBytes = 0

    let id = setInterval(async () => {
      if (!pc) return
      const stats = await pc.getStats()

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'audio') {
          if (report.bytesReceived === lastBytes) {
            console.log('track dead (no data)')
          }
          lastBytes = report.bytesReceived
        }
      })
    }, 2000)
    return clearInterval(id)
  }, [pc])

  return { users, localVideoRef, videosMap, midStreamsMap }
}
