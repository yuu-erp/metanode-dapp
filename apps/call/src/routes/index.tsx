import { useSetupCall } from '@/features'
import { CALL_DEBUG_EVENT, type CallDebugLog, callCtx } from '@/modules/call/call.ctx'
import { endCall } from '@metanodejs/system-core'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

type PullTrackStatus = 'IDLE' | 'WAITING' | 'ANSWERED' | 'OK' | 'TIMEOUT'

function RouteComponent() {
  const { data: setupDone, error } = useSetupCall()
  const router = useRouter()
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const streams = useRef(new Map<string, MediaStream>())
  const localTrackPcRef = useRef<RTCPeerConnection | null>(null)
  const remoteTrackPcRef = useRef<RTCPeerConnection | null>(null)
  const pullTimeoutRef = useRef<number | null>(null)
  const [mids, setMids] = useState<string[]>([])
  const [localReady, setLocalReady] = useState(false)
  const [flowLogs, setFlowLogs] = useState<CallDebugLog[]>(() => callCtx.logs.slice(-20))
  const [pullStatus, setPullStatus] = useState<PullTrackStatus>('IDLE')
  const pullStatusClass =
    pullStatus === 'OK'
      ? 'bg-green-600 text-white'
      : pullStatus === 'TIMEOUT'
        ? 'bg-red-600 text-white'
        : pullStatus === 'WAITING'
          ? 'bg-yellow-500 text-black'
          : pullStatus === 'ANSWERED'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-300 text-black'

  useEffect(() => {
    const syncLocalStream = () => {
      const localEl = localVideoRef.current
      if (!localEl) return
      const stream = callCtx.localStream
      if (!stream) {
        setLocalReady(false)
        if (localEl.srcObject) localEl.srcObject = null
        return
      }

      setLocalReady(true)
      if (localEl.srcObject !== stream) {
        localEl.srcObject = stream
        localEl.play().catch(() => {})
      }
    }

    syncLocalStream()

    const onDebug = (event: Event) => {
      const customEvent = event as CustomEvent<CallDebugLog>
      setFlowLogs((prev) => [...prev.slice(-29), customEvent.detail])
      syncLocalStream()

      if (customEvent.detail.step === 'frontend_event_pull_track_received') {
        setPullStatus('WAITING')
        if (pullTimeoutRef.current) {
          window.clearTimeout(pullTimeoutRef.current)
        }
        pullTimeoutRef.current = window.setTimeout(() => {
          setPullStatus('TIMEOUT')
        }, 12000)
      }

      if (customEvent.detail.step === 'connect_remote_done') {
        setPullStatus('ANSWERED')
      }

      if (customEvent.detail.step === 'remote_track_event') {
        setPullStatus('OK')
        if (pullTimeoutRef.current) {
          window.clearTimeout(pullTimeoutRef.current)
          pullTimeoutRef.current = null
        }
      }
    }

    window.addEventListener(CALL_DEBUG_EVENT, onDebug as EventListener)
    return () => {
      if (pullTimeoutRef.current) {
        window.clearTimeout(pullTimeoutRef.current)
        pullTimeoutRef.current = null
      }
      window.removeEventListener(CALL_DEBUG_EVENT, onDebug as EventListener)
    }
  }, [])

  useEffect(() => {
    const onTrack = (source: 'publisher_pc' | 'remote_pc') => (event: RTCTrackEvent) => {
      console.log('thanhduy - track data:', source, event)
      const mid = event.transceiver.mid
      if (!mid) return
      callCtx.pushLog('remote_track_event', {
        source,
        mid,
        direction: event.transceiver.direction,
        currentDirection: event.transceiver.currentDirection,
        kind: event.track.kind
      })
      const streamKey = `${source}:${mid}`
      let stream = streams.current.get(streamKey)
      if (!stream) {
        stream = new MediaStream()
        streams.current.set(streamKey, stream)
        setMids((prev) => [...prev, streamKey])
      }
      stream.addTrack(event.track)
    }

    const publisherHandler = onTrack('publisher_pc')
    const remoteHandler = onTrack('remote_pc')

    const bindPublisherPc = () => {
      const pc = callCtx.pc
      if (localTrackPcRef.current === pc) return
      if (localTrackPcRef.current) {
        localTrackPcRef.current.removeEventListener('track', publisherHandler)
      }
      pc.addEventListener('track', publisherHandler)
      localTrackPcRef.current = pc
    }

    const bindRemotePc = () => {
      const pc = callCtx.remotePc
      if (remoteTrackPcRef.current === pc) return
      if (remoteTrackPcRef.current) {
        remoteTrackPcRef.current.removeEventListener('track', remoteHandler)
      }
      pc.addEventListener('track', remoteHandler)
      remoteTrackPcRef.current = pc
    }

    bindPublisherPc()
    bindRemotePc()

    const onDebugRebind = (event: Event) => {
      const customEvent = event as CustomEvent<CallDebugLog>
      if (customEvent.detail.step === 'remote_peer_state_reset_done') {
        streams.current.clear()
        setMids([])
      }

      if (
        customEvent.detail.step === 'connect_remote_start' &&
        (customEvent.detail.detail as { usePc?: string } | undefined)?.usePc === 'remote_pc'
      ) {
        bindRemotePc()
      }
    }

    window.addEventListener(CALL_DEBUG_EVENT, onDebugRebind as EventListener)

    return () => {
      window.removeEventListener(CALL_DEBUG_EVENT, onDebugRebind as EventListener)
      if (localTrackPcRef.current) {
        localTrackPcRef.current.removeEventListener('track', publisherHandler)
      }
      if (remoteTrackPcRef.current) {
        remoteTrackPcRef.current.removeEventListener('track', remoteHandler)
      }
    }
  }, [])

  return (
    <div className="p-3 space-y-3">
      <div
        className="size-20 bg-red-300"
        onClick={() => {
          if (window.finSdk) {
            router.history.back()
          } else {
            endCall()
          }
        }}
      >
        ABCD
      </div>

      <div className="text-xs">
        <p>setupDone: {String(setupDone)}</p>
        <p>joinState: {callCtx.joinState}</p>
        <p>roomId: {callCtx.activeRoomId ?? '-'}</p>
        <p>sessionId: {callCtx.activeSessionId ?? '-'}</p>
        <p>localVideo: {localReady ? 'ready' : 'none'}</p>
        <p>
          pullTrack:
          <span className={`ml-2 rounded px-2 py-1 text-[10px] font-semibold ${pullStatusClass}`}>
            {pullStatus}
          </span>
        </p>
        <p>setupError: {error ? String(error) : '-'}</p>
      </div>

      <div>
        <p className="text-xs mb-1">Local</p>
        <video
          ref={localVideoRef}
          muted
          playsInline
          autoPlay
          className="h-24 w-36 border border-black bg-black"
        />
      </div>

      <p className="text-xs">Remote ({mids.length})</p>
      {mids.map((mid) => (
        <video
          key={mid}
          muted={false}
          playsInline
          autoPlay
          ref={(el) => {
            if (!el) return
            const stream = streams.current.get(mid)
            if (!stream) return
            console.log('thanhduy - render video', { el, stream })
            console.log('video srcObject tracks', stream.getTracks())
            console.log('video videoTracks', stream.getVideoTracks())
            if (el.srcObject !== stream) {
              el.srcObject = stream
              el.play().catch(() => {})
            }
          }}
          className="size-20 border border-black"
        />
      ))}

      <div>
        <p className="text-xs mb-1">Flow logs</p>
        <div className="max-h-60 overflow-auto border border-black p-2 text-[11px]">
          {flowLogs.length === 0 ? (
            <p>No logs yet</p>
          ) : (
            flowLogs.map((item, idx) => (
              <p key={`${item.at}-${idx}`}>
                [{item.at}] {item.step}
                {item.detail ? ` ${JSON.stringify(item.detail)}` : ''}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
