import ButtonBase from '@/shared/components/button/button-base'
import { useRouter } from '@tanstack/react-router'
import { Phone } from 'lucide-react'
import { memo } from 'react'

export const EndButton = memo(() => {
  const router = useRouter()

  return (
    <ButtonBase variant="icon" className="bg-[#ff0000]">
      <Phone
        onClick={() => {
          // chatClient.endCall()
          // router.history.back()
        }}
      />
    </ButtonBase>
  )
})
