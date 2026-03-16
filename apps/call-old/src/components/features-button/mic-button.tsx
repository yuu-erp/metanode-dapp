import { useCallStore } from '@/modules'
import { Mic, MicOff } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export const MicButton = memo(() => {
  const on = useCallStore((s) => s.onMicro)

  return (
    <Button size={'icon'} onClick={() => useCallStore.getState().toggleMicro()}>
      {!on ? <Mic /> : <MicOff />}
    </Button>
  )
})
