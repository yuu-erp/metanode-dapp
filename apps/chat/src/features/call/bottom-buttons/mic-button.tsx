import { chatClient } from '@/modules/call/client'
import ButtonBase from '@/shared/components/button/button-base'
import { Mic, MicOff } from 'lucide-react'
import { memo } from 'react'

export const MicButton = memo(() => {
  const connection = chatClient.useMeetingUi((s) => {
    return s.myConnections[0]
  })

  return (
    <ButtonBase variant="icon" onClick={() => chatClient.toggleMic(connection.id)}>
      {connection?.audio ? <Mic /> : <MicOff />}
    </ButtonBase>
  )
})
