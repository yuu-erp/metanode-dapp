import { useEndCall } from '@/hooks/use-end-call'
import { PhoneOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'
import { useEventLog } from '@/hooks'
import { callContext } from '@/modules'
import { compareAddress } from '@/shared'

export type EndCallButtonProps = {}

export const EndCallButton = memo(({}: EndCallButtonProps) => {
  const { mutate, isPending } = useEndCall()

  useEventLog('LeaveRequested', (data) => {
    const { isMeet, roomId } = callContext
    if (isMeet || !compareAddress(roomId, data.roomId)) return
    mutate()
  })

  return (
    <Button size={'icon'} variant={'destructive'} onClick={() => mutate()} loading={isPending}>
      <PhoneOff />
    </Button>
  )
})
