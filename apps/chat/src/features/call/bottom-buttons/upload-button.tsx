import ButtonBase from '@/shared/components/button/button-base'
import { Upload } from 'lucide-react'
import { memo } from 'react'

export const UploadButton = memo(() => {
  return (
    <ButtonBase variant="icon">
      <Upload />
    </ButtonBase>
  )
})
