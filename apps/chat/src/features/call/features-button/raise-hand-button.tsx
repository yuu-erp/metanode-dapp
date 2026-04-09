import { useRaiseHand } from '@app/call'
import { Hand } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export const RaiseHandButton = memo(() => {
  const { raiseHand, isRaise } = useRaiseHand()

  return (
    <Button variant={isRaise ? 'active' : 'default'} size={'icon'} onClick={raiseHand}>
      <Hand />
    </Button>
  )
})
