'use client'

import * as React from 'react'
import { Button } from './ui/button'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

interface ButtonBackProps {
  onBack?: () => void
}

function ButtonBack({ onBack }: ButtonBackProps) {
  const router = useRouter()

  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.history.back()
    }
  }, [onBack, router])

  return (
    <Button
      className="border-app size-14 fixed bottom-5 left-3 bg-white/40 rounded-2xl"
      onClick={handleBack}
    >
      <ChevronLeft className="size-5" />
    </Button>
  )
}

export default React.memo(ButtonBack)
