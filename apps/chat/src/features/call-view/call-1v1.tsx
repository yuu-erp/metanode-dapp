import { callContext, eventBus, useCallStore } from '@/modules'
import { memo, useEffect, useRef, type RefObject } from 'react'

export const Call1v1 = memo(() => {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteStream = useRef(new MediaStream())
  const isLocalConnected = useRef(false)

  const setStream = (ref: RefObject<HTMLVideoElement | null>, stream?: MediaStream) => {
    const el = ref.current
    if (!el || !stream) return
    el.srcObject = stream
    el.play()
  }

  useEffect(() => {
    const { localPc } = callContext

    const localHandler = (e: RTCTrackEvent) => {
      console.log('thanhduy - track data', e)
      useCallStore.setState({ isDone: true })
      remoteStream.current.addTrack(e.track)
    }

    const onLocalStateChage = () => {
      if (localPc.connectionState === 'connected' && !isLocalConnected.current) {
        isLocalConnected.current = true
        setStream(localVideoRef, useCallStore.getState().localStream)
      }
      eventBus.emit('local.pc.state', {
        local: localPc.connectionState,
        remote: ''
      })
    }

    // const remoteHandler =createHandler('local')

    localPc.addEventListener('track', localHandler)
    localPc.addEventListener('connectionstatechange', onLocalStateChage)

    return () => {
      localPc.removeEventListener('track', localHandler)
      localPc.removeEventListener('connectionstatechange', onLocalStateChage)
    }
  }, [])

  useEffect(() => {
    setStream(remoteVideoRef, remoteStream.current)
  }, [])

  return (
    <div className="absolute size-full z-0">
      <div className="size-full relative">
        <div className="h-40 aspect-[0.75] absolute right-5 top-5 bg-black overflow-hidden flex justify-center rounded-md">
          <video
            ref={localVideoRef}
            muted
            playsInline
            autoPlay
            className="h-full w-full object-cover"
          />
        </div>

        <video
          ref={remoteVideoRef}
          muted
          playsInline
          autoPlay
          className="border border-black absolute size-full bg-black -z-1"
        />
      </div>
    </div>
  )
})
