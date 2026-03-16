import { useCallStore } from '@/modules'
import { Video, VideoOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export const CameraButton = memo(() => {
  const on = useCallStore((s) => s.onCamera)

  return (
    <Button size={'icon'} onClick={() => useCallStore.getState().toggleCamera()}>
      {!on ? <Video /> : <VideoOff />}
    </Button>
  )
})
