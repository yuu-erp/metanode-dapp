'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { MapPinIcon, ExternalLinkIcon } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

type Props = {
  message: Extract<Message, { type: 'location' }>
  className?: string
}

function MessageLocation({ message, className }: Props) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${message.latitude},${message.longitude}`

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group w-[260px]',
        className
      )}
      onClick={() => window.open(mapUrl, '_blank')}
    >
      <div className="aspect-[16/9] w-full bg-slate-800 flex items-center justify-center relative">
        {/* Mock Map Background - In a real app, this could be a static map image */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative">
          <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/40 border-2 border-white/20">
            <MapPinIcon size={20} fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="p-3 bg-white/5 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">
            {message.address || 'Shared Location'}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-0.5">
            {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}
          </div>
        </div>
        <div className="flex-shrink-0 text-white/40 group-hover:text-blue-400 transition-colors">
          <ExternalLinkIcon size={14} />
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageLocation)
