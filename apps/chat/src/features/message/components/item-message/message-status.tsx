'use client'
import { AlertTriangle, Check, CheckCheck, Clock } from 'lucide-react'

interface MessageStatusProps {
  message: FulleMessage
}

export function MessageStatusComp({ message }: MessageStatusProps) {
  const { status } = message

  if (message.isRead) return <CheckCheck className="size-3.5" />

  switch (status) {
    case 'sent':
      return <Check className="size-3.5 text-white" />

    case 'delivered':
      return <Check className="size-3.5 text-white" />

    case 'failed':
      return <AlertTriangle className="size-4 text-red-500" />

    default:
      return <Clock className="size-3.5 text-white opacity-70" />
  }
}
