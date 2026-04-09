import { useMyStream, useParticipantMediaStreams, useUserStore } from '@app/call'
import { memo, useEffect, useRef } from 'react'

export const Call1v1 = memo(() => {
  const { stream } = useMyStream()
  const user = useUserStore((s) => s.users[1])

  const { stream: remoteStream } = useParticipantMediaStreams(user ?? '')

  const ref = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !stream) return
    el.srcObject = stream
  }, [stream])

  useEffect(() => {
    const el = remoteRef.current
    if (!el || !remoteStream) return
    el.srcObject = remoteStream
  }, [remoteStream])

  return (
    <div className="absolute size-full z-0 bg-black">
      <div className="size-full relative">
        <div className="h-40 aspect-[0.75] absolute right-5 top-5 bg-black overflow-hidden flex justify-center rounded-md border">
          <video ref={ref} muted playsInline autoPlay className="h-full w-full object-cover " />
        </div>
        <video ref={remoteRef} playsInline autoPlay className="h-full w-full object-cover " />
      </div>
    </div>
  )
})
