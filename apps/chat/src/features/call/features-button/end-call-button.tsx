import { useEndCallAndCloseView } from '@app/call'
import { PhoneOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export type EndCallButtonProps = {}

export const EndCallButton = memo(({}: EndCallButtonProps) => {
  const { loading, enCallAndCloseView } = useEndCallAndCloseView()

  return (
    <>
      <Button size={'icon'} variant={'destructive'} onClick={enCallAndCloseView} loading={loading}>
        <PhoneOff />
      </Button>
    </>
  )
})
