'use client'

import { useBackgroundTaskStatus } from '@/shared/background-sync'
import { useI18N } from '@/shared/hooks'
import { LoaderCircle } from 'lucide-react'
import * as React from 'react'

function ConversationBackgroundSync() {
  const { t } = useI18N()
  const status = useBackgroundTaskStatus('conversation-sync')
  console.log('status', status)
  return (
    <React.Fragment>
      {(status === 'updating' || status === 'connecting') && (
        <div className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-1">
          <LoaderCircle className="size-4 animate-spin" />
          <span className="font-semibold">{t(`status.${status}`)}...</span>
        </div>
      )}
    </React.Fragment>
  )
}

export default React.memo(ConversationBackgroundSync)
