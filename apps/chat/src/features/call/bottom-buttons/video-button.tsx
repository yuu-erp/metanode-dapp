import { chatClient } from '@/modules/call/client'
import ButtonBase from '@/shared/components/button/button-base'
import { Video, VideoOff } from 'lucide-react'
import { memo } from 'react'

export const VideoButton = memo(() => {
  const connection = chatClient.useMeetingUi((s) => s.myConnections[0])

  return (
    <ButtonBase onClick={() => chatClient.toggleCamera(connection.id)} variant="icon">
      {connection?.video ? <Video /> : <VideoOff />}
    </ButtonBase>
  )
})
