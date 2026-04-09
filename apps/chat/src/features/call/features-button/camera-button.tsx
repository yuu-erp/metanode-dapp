import { useToggleSourceEnabled } from '@app/call'
import { Video, VideoOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export const CameraButton = memo(() => {
  const { enabled, onClick } = useToggleSourceEnabled('camera')

  return (
    <>
      <Button size={'icon'} onClick={onClick}>
        {enabled ? <Video /> : <VideoOff />}
      </Button>
    </>
  )
})
