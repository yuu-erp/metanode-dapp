'use client'
import * as React from 'react'
import { useI18N } from '../hooks'
import { useBackgroundTaskStatus } from '../background-sync'
import { cn } from '../lib'
import { LoaderCircle } from 'lucide-react'

interface StatusSyncProps extends React.HTMLAttributes<HTMLDivElement> {}
function StatusSync({ className, ...props }: StatusSyncProps) {
  const { t } = useI18N()
  const backgroundStatus = useBackgroundTaskStatus('conversation-sync')
  // Xác định trạng thái nào sẽ hiển thị (ưu tiên background sync)
  let displayStatus: 'updating' | 'connecting' | 'error' | null = null
  let displayTextKey: string | null = null

  if (
    backgroundStatus === 'updating' ||
    backgroundStatus === 'connecting' ||
    backgroundStatus === 'error'
  ) {
    displayStatus = backgroundStatus
    displayTextKey = `status.${backgroundStatus}`
  }
  // Chỉ render khi có trạng thái cần hiển thị
  if (!displayStatus) return null
  return (
    <React.Fragment>
      <div className={cn('flex items-center gap-1', className)} {...props}>
        <LoaderCircle className="size-4 animate-spin" />
        <span className="font-semibold flex items-center whitespace-nowrap">
          {t(displayTextKey)}
        </span>
      </div>
    </React.Fragment>
  )
}

export default React.memo(StatusSync)
