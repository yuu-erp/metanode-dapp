import { useSendVoice } from '@/new/message/send-message-v4'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { Send, Trash2 } from 'lucide-react'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'

export type VoiceRecorderProp = {}

type RecordingTimerHandle = {
  start: () => void
  stop: () => void
}

function formatRecordingDurationParts(elapsedMs: number) {
  const totalSec = Math.floor(elapsedMs / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  const ms = Math.floor(elapsedMs % 1000)

  return {
    main: `${mins}:${secs.toString().padStart(2, '0')}`,
    ms: ms.toString().padStart(3, '0')
  }
}

const RecordingTimer = memo(
  forwardRef<RecordingTimerHandle>((_, ref) => {
    const [elapsedMs, setElapsedMs] = useState(0)
    const startedAtRef = useRef<number | null>(null)
    const rafRef = useRef<number | null>(null)

    const stopLoop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const tick = () => {
      if (startedAtRef.current === null) return
      setElapsedMs(performance.now() - startedAtRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    useImperativeHandle(ref, () => ({
      start: () => {
        stopLoop()
        startedAtRef.current = performance.now()
        setElapsedMs(0)
        rafRef.current = requestAnimationFrame(tick)
      },
      stop: () => {
        stopLoop()
        startedAtRef.current = null
        setElapsedMs(0)
      }
    }))

    useEffect(() => () => stopLoop(), [])

    const { main, ms } = formatRecordingDurationParts(elapsedMs)

    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-white">
        <div className="flex gap-2 items-center">
          <span className="tabular-nums text-lg font-medium leading-none">{main}</span>
          <span className="tabular-nums text-xs text-white/70 leading-none">{ms} ms</span>
        </div>
        <span className="text-xs text-white/60 mt-0.5">Nhấn gửi để gửi tin nhắn thoại</span>
      </div>
    )
  })
)

export const VoiceRecorder = memo(({}: VoiceRecorderProp) => {
  const micOpen = useUiStore((s) => s.micOpen)

  const audioRef = useRef<HTMLAudioElement>(null)
  const recordingTimerRef = useRef<RecordingTimerHandle>(null)

  const recorder = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const shouldSendOnStopRef = useRef(false)

  // 👇 dùng để tính duration
  const recordingStartedAtRef = useRef(0)

  const { sendVoice } = useSendVoice()

  const stopTimer = () => recordingTimerRef.current?.stop()
  const startTimer = () => recordingTimerRef.current?.start()

  const cleanupRecording = () => {
    stopTimer()

    recordingStartedAtRef.current = 0

    streamRef.current?.getTracks().forEach((track) => {
      track.stop()
    })

    streamRef.current = null
    recorder.current = null
    chunks.current = []
  }

  const onStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    streamRef.current = stream

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType
    })

    recorder.current = mediaRecorder
    chunks.current = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.current.push(e.data)
      }
    }

    mediaRecorder.onstop = async () => {
      const shouldSend = shouldSendOnStopRef.current
      shouldSendOnStopRef.current = false

      stream.getTracks().forEach((track) => {
        track.stop()
      })

      if (!shouldSend) {
        chunks.current = []
        recorder.current = null
        streamRef.current = null
        return
      }

      const duration = Math.round(performance.now() - recordingStartedAtRef.current)

      const blob = new Blob(chunks.current, {
        type: mediaRecorder.mimeType
      })

      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
      }

      const file = new File([blob], 'record.webm', {
        type: blob.type
      })

      if (file.size > 0) {
        console.log('file voice', file)
        sendVoice({ file, metadata: { duration } })
      }

      chunks.current = []
      recorder.current = null
      streamRef.current = null

      uiActions.setMicOpen(false)
    }

    // 👇 lưu thời điểm bắt đầu ghi
    recordingStartedAtRef.current = performance.now()

    mediaRecorder.start(1000)
    startTimer()

    console.log('[recording started]')
  }

  const onStop = () => {
    if (!recorder.current || recorder.current.state === 'inactive') return
    recorder.current.stop()
  }

  const onCancel = () => {
    shouldSendOnStopRef.current = false
    onStop()
    cleanupRecording()
    uiActions.setMicOpen(false)
  }

  const onSend = () => {
    shouldSendOnStopRef.current = true
    onStop()
  }

  useEffect(() => {
    if (!micOpen) return

    shouldSendOnStopRef.current = false
    onStart()

    return () => {
      cleanupRecording()
    }
  }, [micOpen])

  return (
    <>
      <audio className="hidden" ref={audioRef} controls />

      {micOpen && (
        <div className="px-2 py-5 absolute z-10 bottom-0 right-0 w-full">
          <div className="h-12 w-full flex items-center justify-between">
            <div />

            <RecordingTimer ref={recordingTimerRef} />

            <button
              type="button"
              className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
              onClick={onCancel}
            >
              <Trash2 className="text-white/80 size-4" fill="#fff" />
            </button>

            <button
              type="button"
              className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
              onClick={onSend}
            >
              <Send className="text-white size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
})
