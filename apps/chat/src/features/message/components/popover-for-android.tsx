import { usePlatform } from '@/hooks/core/use-platform'
import React, { memo, useState, type PropsWithChildren } from 'react'

export const PopoverForAndroid = memo(
  ({
    children,
    content
  }: PropsWithChildren & {
    content: (close: () => void) => React.ReactNode
  }) => {
    const { data } = usePlatform()
    const [open, setOpen] = useState(false)
    console.log('platform data', data)
    if (data !== 'ANDROID' && data !== 'IOS') return children

    const close = () => setOpen(false)

    return (
      <>
        <div onClick={() => setOpen(true)}>{children}</div>

        {open && (
          <div className="fixed inset-0 z-50 text-foreground">
            {/* overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={close} />

            {/* popover */}
            <div className="absolute bottom-20 left-5 bg-white rounded-2xl p-4 min-w-[200px]">
              {content(close)}
            </div>
          </div>
        )}
      </>
    )
  }
)
