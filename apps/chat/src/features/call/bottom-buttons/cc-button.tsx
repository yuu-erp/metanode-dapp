import ButtonBase from '@/shared/components/button/button-base'
import { Subtitles } from 'lucide-react'
import { memo } from 'react'

export const CcButton = memo(() => {
  return (
    <ButtonBase variant="icon">
      <Subtitles />
    </ButtonBase>
  )
})
