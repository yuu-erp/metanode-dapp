'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { PlayIcon, PauseIcon, MicIcon } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

type Props = {
  message: Extract<Message, { type: 'voice' }>
  className?: string
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function MessageVoice({ message, className }: Props) {
  const [isPlaying, setIsPlaying] = React.useState(false)

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // Audio logic would go here
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 pr-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all min-w-[200px] group',
        className
      )}
    >
      <button
        onClick={togglePlayback}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-white transition-colors shadow-lg shadow-blue-500/20"
      >
        {isPlaying ? (
          <PauseIcon size={18} fill="currentColor" />
        ) : (
          <PlayIcon size={18} fill="currentColor" className="ml-1" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1 rounded-full bg-white/30 transition-all duration-300',
                isPlaying ? 'animate-pulse' : ''
              )}
              style={{
                height: `${Math.max(4, Math.random() * 16)}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] font-medium text-white/40 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <MicIcon size={10} />
            <span>Voice Memo</span>
          </div>
          <span>{formatDuration(message.duration)}</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageVoice)
