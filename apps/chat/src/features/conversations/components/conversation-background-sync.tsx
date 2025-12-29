'use client'

import { useWeb3Provider } from '@/contexts/web3-provider.context'
import { useBackgroundTaskStatus } from '@/shared/background-sync'
import { useI18N } from '@/shared/hooks'
import { LoaderCircle } from 'lucide-react'
import * as React from 'react'

function ConversationBackgroundSync() {
  const { t } = useI18N()
  const backgroundStatus = useBackgroundTaskStatus('conversation-sync')
  console.log('backgroundStatus: ', backgroundStatus)
  const { isConnecting: isWsConnecting } = useWeb3Provider()
  console.log('isWsConnecting: ', isWsConnecting)
  // Xác định trạng thái nào sẽ hiển thị (ưu tiên background sync)
  let displayStatus: 'updating' | 'connecting' | null = null
  let displayTextKey: string | null = null

  if (backgroundStatus === 'updating' || backgroundStatus === 'connecting') {
    displayStatus = backgroundStatus
    displayTextKey = `status.${backgroundStatus}`
  } else if (isWsConnecting) {
    displayStatus = 'connecting'
    displayTextKey = 'status.connecting' // hoặc 'status.websocket_connecting' nếu bạn muốn phân biệt
  }
  console.log('displayStatus', displayStatus)
  // Chỉ render khi có trạng thái cần hiển thị
  if (!displayStatus) return null

  return (
    <React.Fragment>
      <div className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-1">
        <LoaderCircle className="size-4 animate-spin" />
        <span className="font-semibold flex items-center">{t(displayTextKey)}</span>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ConversationBackgroundSync)
