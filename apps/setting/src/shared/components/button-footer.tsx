'use client'
import * as React from 'react'
import { Button } from './ui/button'
import { ChevronLeft } from 'lucide-react'

interface ButtonFooterProps {
  btnContent?: string
  onBack?: () => void
  onNext?: () => void
}
function ButtonFooter({ btnContent = 'next', onBack, onNext }: ButtonFooterProps) {
  return (
    <React.Fragment>
      <div className="h-[96px] flex items-center justify-center">
        <div className="w-full h-14 flex items-center gap-1">
          <Button
            className="h-full aspect-square border-app bg-white/70 rounded-l-2xl rounded-r-none"
            onClick={onBack}
          >
            <ChevronLeft className="size-5 text-black/60" />
          </Button>
          <Button
            className="h-full flex-1 rounded-r-2xl rounded-l-none border-app bg-white/70 text-lg font-bold uppercase text-black/60"
            onClick={onNext}
          >
            {btnContent}
          </Button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ButtonFooter)
