'use client'
import { Button } from '@/shared/components/ui/button'
import * as React from 'react'

interface BoxRefetchDappProps {
  onRefetch?: () => void
}
function BoxRefetchDapp({ onRefetch }: BoxRefetchDappProps) {
  return (
    <React.Fragment>
      <div className="w-full flex items-center p-2 background-card rounded-xl">
        <div className="flex-1 text-black/60 font-semibold">
          The shared folder will replace the current profile. Do you want to update it?
        </div>
        <Button onClick={onRefetch}>UPDATE</Button>
      </div>
    </React.Fragment>
  )
}

export default React.memo(BoxRefetchDapp)
