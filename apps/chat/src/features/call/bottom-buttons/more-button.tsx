import ButtonBase from '@/shared/components/button/button-base'
import { EllipsisVertical } from 'lucide-react'
import { memo } from 'react'

export const MoreButton = memo(() => {
  return (
    <ButtonBase variant="icon">
      <EllipsisVertical />{' '}
    </ButtonBase>
  )
})
