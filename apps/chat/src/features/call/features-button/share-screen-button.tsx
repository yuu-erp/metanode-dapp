import { useScreenShareActions, useShareState } from '@app/call'
import { Share } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../ui'

export type ShareScreenButtonProps = {}

export const ShareScreenButton = memo(() => {
  const { isShare, isSharing } = useShareState()
  const { startShareScreen, stopShareScreen } = useScreenShareActions()

  const onClick = isShare ? stopShareScreen : startShareScreen

  return (
    <Button
      size={'icon'}
      loading={isSharing}
      onClick={onClick}
      variant={isShare ? 'active' : 'default'}
    >
      <Share />
    </Button>
  )
})
