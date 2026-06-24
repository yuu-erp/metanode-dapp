import AvatarUser from '@/shared/components/avatar-user'
import { cn } from '@/shared/lib/utils'
import { Phone, X } from 'lucide-react'
import { useIncomingCall } from './use-incoming-call'
import { useQuery } from '@tanstack/react-query'
import { createGetConversationIdQueryOptions } from '@/shared/hooks'

export function IncomingCall() {
  const { incomingCall, acceptCall, rejectCall } = useIncomingCall()
  const type = incomingCall?.conversationType ?? ('' as any)
  const conversationId = (type === 'p2p' ? incomingCall?.caller : incomingCall?.callee) ?? ''
  const { data } = useQuery({
    ...createGetConversationIdQueryOptions(conversationId, type),
    enabled: !!incomingCall && !!type
  })

  if (!incomingCall) return null
  return (
    <div
      className={cn(
        'fixed z-50 left-0 right-0 px-2 transition-all duration-500 ease-in-out',
        window.isHasNotch ? 'top-14 pt-safe' : 'top-10'
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-sm overflow-hidden',
          'bg-neutral-900/80 backdrop-blur-xl border border-white/10',
          'shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]',
          'p-4',
          'animate-in slide-in-from-top-4 duration-500',
          window.isHasNotch ? 'rounded-full' : 'rounded-2xl'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarUser name={data?.name ?? ''} size="lg" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Video Call
                </span>
              </div>
              <span className="font-semibold text-white text-lg truncate pr-2">{data?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={rejectCall}
              className="group relative flex items-center justify-center size-12 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300"
            >
              <X className="size-5 transition-transform group-hover:scale-110" />
            </button>

            <button
              onClick={acceptCall}
              className="group relative flex items-center justify-center size-12 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-20 group-hover:opacity-40"></div>
              <Phone className="size-5 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
