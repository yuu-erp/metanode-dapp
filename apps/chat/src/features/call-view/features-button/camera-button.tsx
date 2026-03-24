import { Video, VideoOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'
import { PermissionPopup } from './permission-popup'
import { callActions, useCall } from '@/modules/call'
import { useShallow } from 'zustand/shallow'

export const CameraButton = memo(() => {
  const { on, popup } = useCall(useShallow((s) => s.video))

  return (
    <>
      <Button size={'icon'} onClick={() => callActions.toggleMedia('video')}>
        {on ? <Video /> : <VideoOff />}
      </Button>

      <PermissionPopup
        children="Please turn on camera permission in setting"
        open={popup}
        setOpen={(v) =>
          callActions.updateMedia('video', {
            popup: v
          })
        }
      />
    </>
  )
})
