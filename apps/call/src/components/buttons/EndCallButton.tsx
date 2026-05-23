import { useEndCallAndCloseView, useUserStore } from '@app/call'
import { PhoneOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export const EndCallButton = memo(() => {
  const { loading, enCallAndCloseView } = useEndCallAndCloseView()

  return (
    <>
      <Button
        className="bg-[#ff0000]"
        onClick={() => {
          console.log('[EndCallButton] users', useUserStore.getState().users)
          enCallAndCloseView()
        }}
        loading={loading}
      >
        <PhoneOff />
      </Button>
    </>
  )
})
