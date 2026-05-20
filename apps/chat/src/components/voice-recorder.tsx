import { useSendFileV2 } from '@/hooks/mesage/use-send-file-v2'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { Square, Trash2 } from 'lucide-react'
import { memo, useEffect, useRef } from 'react'

export type VoiceRecorderProp = {}

export const VoiceRecorder = memo(({}: VoiceRecorderProp) => {
  const micOpen = useUiStore((s) => s.micOpen)

  const audioRef = useRef<HTMLAudioElement>(null)

  const recorder = useRef<MediaRecorder | null>(null)

  const streamRef = useRef<MediaStream | null>(null)

  const chunks = useRef<Blob[]>([])

  const sendFile = useSendFileV2('voice')

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
      console.log('[ondataavailable]', e.data.size)

      if (e.data.size > 0) {
        chunks.current.push(e.data)
      }
    }

    mediaRecorder.onstop = async () => {
      console.log('[onstop]')

      const blob = new Blob(chunks.current, {
        type: mediaRecorder.mimeType
      })

      console.log('[blob]', blob.size)

      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
      }

      const file = new File([blob], 'record.webm', {
        type: blob.type
      })

      console.log('[file]', file)

      if (file.size > 0) {
        sendFile.mutate([file])
      }

      chunks.current = []

      stream.getTracks().forEach((track) => {
        track.stop()
      })

      recorder.current = null
    }

    mediaRecorder.start(1000)

    console.log('[recording started]')
  }

  const onStop = () => {
    if (!recorder.current) return

    console.log('[stop recording]')

    recorder.current.stop()
  }

  useEffect(() => {
    if (!micOpen) return

    onStart()

    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop()
      })
    }
  }, [micOpen])

  return (
    <>
      <audio className="hidden" ref={audioRef} controls />

      {micOpen && (
        <div className="px-2 py-5 absolute z-10 bottom-0 right-0 w-full ">
          <div className="h-12 w-full flex items-center justify-between">
            <div />

            <div className="flex-1 text-center">Click stop to send the voice</div>

            <button
              className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
              onClick={() => {
                uiActions.setMicOpen(false)
              }}
            >
              <Trash2 className="text-white/80 size-4" fill="#fff" />
            </button>

            <button
              className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
              onClick={() => {
                onStop()
                uiActions.setMicOpen(false)
              }}
            >
              <Square className="text-white/80 size-4" fill="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  )
})
