import { useToggleSourceEnabled } from '@app/call'
import { Mic, MicOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export const MicButton = memo(() => {
  const { enabled, onClick } = useToggleSourceEnabled('microphone')

  return (
    <>
      <Button onClick={onClick}>{enabled ? <Mic /> : <MicOff />}</Button>
    </>
  )
})
