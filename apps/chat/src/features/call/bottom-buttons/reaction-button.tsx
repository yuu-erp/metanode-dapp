import ButtonBase from '@/shared/components/button/button-base'
import { Laugh } from 'lucide-react'
import { memo } from 'react'

export const ReactionButton = memo(() => {
  return (
    <ButtonBase variant="icon">
      <Laugh />
    </ButtonBase>
  )
})
