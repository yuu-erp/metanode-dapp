import { cn } from '@/shared/lib'
import { useStream } from '@app/call'
import { memo, useEffect, useRef, type CSSProperties } from 'react'

export type ParticipantViewProp = {
  streamKey: string
  className?: string
  style?: CSSProperties
}

export const ParticipantView = memo(({ streamKey, className, style }: ParticipantViewProp) => {
  const stream = useStream(streamKey)
  const ref = useRef<HTMLVideoElement>(null!)

  useEffect(() => {
    const el = ref.current
    if (!el || !stream) return
    el.srcObject = stream
    el.play()
  }, [stream])

  return (
    <video
      style={style}
      ref={ref}
      className={cn('object-contain bg-black rounded-lg border ', className)}
      playsInline
      autoPlay
    />
  )
})
