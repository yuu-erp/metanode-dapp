import { useToggleSourceEnabled } from '@app/call'
import { Video, VideoOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export const CamButton = memo(() => {
  const { enabled, onClick } = useToggleSourceEnabled('camera')

  return (
    <>
      <Button onClick={onClick}>{enabled ? <Video /> : <VideoOff />}</Button>
    </>
  )
})
