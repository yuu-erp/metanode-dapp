import { callActions, useCall } from '@/modules/call'
import { Mic, MicOff } from 'lucide-react'
import { memo } from 'react'
import { useShallow } from 'zustand/shallow'
import { Button } from '../ui'
import { PermissionPopup } from './permission-popup'

export const MicButton = memo(() => {
  const { on, popup } = useCall(useShallow((s) => s.audio))

  return (
    <>
      <Button size={'icon'} onClick={() => callActions.toggleMedia('audio')}>
        {on ? <Mic /> : <MicOff />}
      </Button>

      <PermissionPopup
        children="Please turn on Micro permission in setting"
        open={popup}
        setOpen={(v) =>
          callActions.updateMedia('audio', {
            popup: v
          })
        }
      />
    </>
  )
})
