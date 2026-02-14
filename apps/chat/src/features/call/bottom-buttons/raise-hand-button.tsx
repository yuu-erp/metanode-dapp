import ButtonBase from '@/shared/components/button/button-base'
import { Hand } from 'lucide-react'
import { memo } from 'react'

export const RaiseHandButton = memo(() => {
  return (
    <ButtonBase variant="icon">
      <Hand />
    </ButtonBase>
  )
})
