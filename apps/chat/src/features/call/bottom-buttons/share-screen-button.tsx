import { chatClient } from '@/modules/call/client'
import ButtonBase from '@/shared/components/button/button-base'
import { MonitorUp } from 'lucide-react'
import { memo } from 'react'

export const ShareScreenButton = memo(() => {
  return (
    <ButtonBase variant="icon" onClick={chatClient.shareScreen}>
      <MonitorUp />
    </ButtonBase>
  )
})
