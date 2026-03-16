import { PhoneOff } from 'lucide-react'
import { memo } from 'react'
import { useEndCall, useEventBus } from '../hooks'
import { Button } from '../ui'

export type EndCallButtonProps = {}

export const EndCallButton = memo(({}: EndCallButtonProps) => {
  const { mutate, isPending } = useEndCall()

  useEventBus('call.end', () => mutate())

  return (
    <Button size={'icon'} variant={'destructive'} onClick={() => mutate()} loading={isPending}>
      <PhoneOff />
    </Button>
  )
})
