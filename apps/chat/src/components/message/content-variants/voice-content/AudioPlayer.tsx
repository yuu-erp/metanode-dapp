import { useCache, useMetadata } from 'file-core'
import { Pause, Play } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

export type AudioPlayerProps = {
  id: string
}

function formatAudioTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `${secs} sec`
}

export const AudioPlayer = memo(({ id }: AudioPlayerProps) => {
  const { cache } = useCache(id)
  const { metadata } = useMetadata(id)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const displayDuration = (metadata?.duration ?? 0) / 1000
  const [currentTime, setCurrentTime] = useState(0)
  const isSeekingRef = useRef(false)
  const progressPercent = Math.min(100, Math.max(0, (currentTime / displayDuration) * 100))
  const [isSeeking, setIsSeeking] = useState(false)
  const progressBarRef = useRef<HTMLDivElement | null>(null)

  const handleToggle = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }

  const durationLabel = `${formatAudioTime(currentTime)} / ${formatAudioTime(displayDuration)}`

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current
      const audio = audioRef.current
      if (!bar || !audio || displayDuration == null || displayDuration <= 0) return

      const rect = bar.getBoundingClientRect()
      if (rect.width <= 0) return

      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const time = ratio * displayDuration
      audio.currentTime = time
      setCurrentTime(time)
    },
    [displayDuration]
  )

  const handleProgressPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const bar = event.currentTarget
    bar.setPointerCapture(event.pointerId)
    isSeekingRef.current = true
    setIsSeeking(true)
    seekFromClientX(event.clientX)
  }

  const handleProgressPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return
    seekFromClientX(event.clientX)
  }

  const handleProgressPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    isSeekingRef.current = false
    setIsSeeking(false)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let isMounted = true

    const handleTimeUpdate = () => {
      if (!isMounted || isSeekingRef.current) return
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)

      if (audio.duration && Number.isFinite(audio.duration)) {
        setCurrentTime(audio.duration)
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    audio.preload = 'metadata'

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    audio.load()

    return () => {
      isMounted = false

      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        className="flex shrink-0 cursor-pointer items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div className="min-w-0 flex-1 text-sm text-left">
        <div>{metadata?.name}</div>
        <div
          ref={progressBarRef}
          className={`mt-1.5 flex h-3 w-full touch-none items-center cursor-pointer`}
          role="slider"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          onPointerDown={handleProgressPointerDown}
          onPointerMove={handleProgressPointerMove}
          onPointerUp={handleProgressPointerUp}
          onPointerCancel={handleProgressPointerUp}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200/80">
            <div
              className={`h-full rounded-full bg-blue-500 ${
                isSeeking ? '' : 'transition-[width] duration-150 ease-linear'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="mt-1 text-xs text-gray-400">{durationLabel}</div>
      </div>

      <audio ref={audioRef} className="hidden" src={cache?.previewPath} />
    </div>
  )
})
