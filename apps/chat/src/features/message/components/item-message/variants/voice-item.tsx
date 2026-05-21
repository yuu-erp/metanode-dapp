import { useDownloadFile } from '@/features/message/hooks'
import type { Message } from '@/modules/message'
import { Pause, Play } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { container } from '@/container'

export type VoiceItemProp = {
  message: Extract<Message, { type: 'voice' }>
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

export const VoiceItem = memo(({ message }: VoiceItemProp) => {
  const { isDownloading, progress, downloadFile, downloadedFileId } = useDownloadFile()
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | undefined>()
  const [shouldPlayOnReady, setShouldPlayOnReady] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const isSeekingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const fileId = message.fileId
  const isDownloadingThis = isDownloading && downloadedFileId === fileId

  const displayDuration = audioDuration ?? (message.duration > 0 ? message.duration : null)
  const isSeekable =
    !isDownloadingThis && !!audioUrl && displayDuration != null && displayDuration > 0

  const progressPercent = useMemo(() => {
    if (isDownloadingThis) {
      return Math.min(100, Math.max(0, progress))
    }
    if (displayDuration == null || displayDuration <= 0) return 0
    return Math.min(100, Math.max(0, (currentTime / displayDuration) * 100))
  }, [isDownloadingThis, progress, displayDuration, currentTime])

  const durationLabel = useMemo(() => {
    if (isDownloadingThis) return `Downloading ${progress}%`
    if (displayDuration == null) return 'Voice memo'
    return `${formatAudioTime(currentTime)} / ${formatAudioTime(displayDuration)}`
  }, [isDownloadingThis, progress, displayDuration, currentTime])

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
    if (!isSeekable) return

    event.preventDefault()
    event.stopPropagation()

    const bar = event.currentTarget
    bar.setPointerCapture(event.pointerId)
    isSeekingRef.current = true
    setIsSeeking(true)
    seekFromClientX(event.clientX)
  }

  const handleProgressPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current || !isSeekable) return
    seekFromClientX(event.clientX)
  }

  const handleProgressPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    isSeekingRef.current = false
    setIsSeeking(false)
  }

  useEffect(() => {
    setAudioDuration(null)
    setCurrentTime(0)
  }, [audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    let isMounted = true

    const updateDuration = () => {
      if (!isMounted) return

      const duration = audio.duration

      if (Number.isFinite(duration) && duration > 0) {
        setAudioDuration(duration)
      }
    }

    const handleLoadedMetadata = () => {
      // Một số browser trả Infinity với blob audio
      if (audio.duration === Infinity) {
        audio.currentTime = 1e101

        const handleTimeUpdate = () => {
          audio.removeEventListener('timeupdate', handleTimeUpdate)

          audio.currentTime = 0

          updateDuration()
        }

        audio.addEventListener('timeupdate', handleTimeUpdate)
      } else {
        updateDuration()
      }
    }

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

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    audio.load()

    return () => {
      isMounted = false

      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)

      URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [audioUrl])

  const handleToggle = async () => {
    if (!audioUrl) {
      if (!fileId) return

      await downloadFile(fileId, fileId, '', message.mimeType)

      const file = await container.fileCacheService.getFile(fileId)

      if (!file) return
      setAudioUrl(URL.createObjectURL(file.blob))
      setShouldPlayOnReady(true)
      return
    }

    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }

  useEffect(() => {
    if (audioUrl && shouldPlayOnReady && audioRef.current) {
      audioRef.current
        .play()
        .catch(() => {
          setIsPlaying(false)
        })
        .finally(() => {
          setShouldPlayOnReady(false)
        })
    }
  }, [audioUrl, shouldPlayOnReady])

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
        <div>Voice memo</div>
        <div
          ref={progressBarRef}
          className={`mt-1.5 flex h-3 w-full touch-none items-center ${
            isSeekable ? 'cursor-pointer' : 'cursor-default'
          }`}
          role="slider"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={isDownloadingThis ? 'Downloading voice' : 'Playback position'}
          aria-disabled={!isSeekable}
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
      <audio ref={audioRef} className="hidden" src={audioUrl} />
    </div>
  )
})
