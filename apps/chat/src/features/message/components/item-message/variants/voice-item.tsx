import { useCachedFile } from '@/features/message/hooks/use-cached-file'
import { useDownloadFile } from '@/features/message/hooks'
import type { Message } from '@/modules/message'
import { Pause, Play } from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'

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

function getFiniteAudioDuration(audio: HTMLAudioElement): number | null {
  const duration = audio.duration
  return Number.isFinite(duration) && duration > 0 ? duration : null
}

export const VoiceItem = memo(({ message }: VoiceItemProp) => {
  const { isDownloading, progress, downloadFile, downloadedFileId } = useDownloadFile()
  const { cachedFile } = useCachedFile(message.fileId || message.id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | undefined>()
  const [shouldPlayOnReady, setShouldPlayOnReady] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileId = message.fileId || message.id
  const isDownloadingThis = isDownloading && downloadedFileId === fileId

  const localFilePath = useMemo(() => {
    return (message as any).filePath as string | undefined
  }, [message])

  const displayDuration = audioDuration ?? (message.duration > 0 ? message.duration : null)

  const durationLabel = useMemo(() => {
    if (isDownloadingThis) return `Downloading ${progress}%`
    if (displayDuration == null) return 'Voice memo'
    if (isPlaying) {
      return `${formatAudioTime(currentTime)} / ${formatAudioTime(displayDuration)}`
    }
    return formatAudioTime(displayDuration)
  }, [isDownloadingThis, progress, displayDuration, isPlaying, currentTime])

  useEffect(() => {
    setAudioDuration(null)
    setCurrentTime(0)
  }, [audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setIsPlaying(false)
      const duration = getFiniteAudioDuration(audio)
      if (duration != null) {
        setCurrentTime(duration)
      }
    }
    const handlePause = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handleLoadedMetadata = () => {
      const duration = getFiniteAudioDuration(audio)
      if (duration != null) {
        setAudioDuration(duration)
      }
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }
    const handleDurationChange = () => {
      const duration = getFiniteAudioDuration(audio)
      if (duration != null) {
        setAudioDuration(duration)
      }
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('timeupdate', handleTimeUpdate)

    handleLoadedMetadata()

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [audioUrl])

  useEffect(() => {
    let objectUrl: string | undefined

    if (cachedFile?.blob) {
      objectUrl = URL.createObjectURL(cachedFile.blob)
      setAudioUrl(objectUrl)
    } else if (localFilePath && /^(blob:|https?:|data:)/.test(localFilePath)) {
      setAudioUrl(localFilePath)
    } else {
      setAudioUrl(undefined)
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [cachedFile, localFilePath])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
    }
  }, [audioUrl])

  const handleToggle = async () => {
    if (!audioUrl) {
      if (!fileId) return

      setShouldPlayOnReady(true)
      await downloadFile(fileId, fileId, '', message.mimeType)
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
    <div className="flex items-center gap-2 cursor-pointer" onClick={handleToggle}>
      <button
        type="button"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div className="text-sm text-left">
        <div>Voice memo</div>
        <div className="text-xs text-gray-400">{durationLabel}</div>
      </div>
      <audio ref={audioRef} className="hidden" src={audioUrl} />
    </div>
  )
})
