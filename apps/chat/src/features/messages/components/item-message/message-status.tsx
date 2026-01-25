'use client'
import type { MessageStatus } from '@/modules/message'
import { AlertTriangle, Check, CheckCheck, Clock } from 'lucide-react'
import * as React from 'react'

interface MessageStatusProps {
  status?: MessageStatus
}

function MessageStatus({ status }: MessageStatusProps) {
  switch (status) {
    case 'sent':
      return <Check className="size-3.5 text-white" />

    case 'delivered':
      return <CheckCheck className="size-3.5 text-white" />

    case 'read':
      return <CheckCheck className="size-3.5 text-green-500" />

    case 'failed':
      return <AlertTriangle className="size-4 text-red-500" />

    default:
      return <Clock className="size-3.5 text-white opacity-70" />
  }
}

export default React.memo(MessageStatus)
