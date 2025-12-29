'use client'

import * as React from 'react'
import { cn } from '@/shared/lib'

interface Props extends React.HTMLAttributes<HTMLElement> {
  alwaysScrolled?: boolean
}

export const WapperHeader = React.forwardRef<HTMLElement, Props>(
  ({ className, children, alwaysScrolled = false, ...props }, ref) => {
    const localRef = React.useRef<HTMLElement>(null)

    React.useImperativeHandle(ref, () => localRef.current!)

    // --- set CSS variable header height ---
    React.useLayoutEffect(() => {
      if (!localRef.current) return

      const updateHeight = () => {
        const height = localRef.current!.offsetHeight
        document.documentElement.style.setProperty('--header-height', `${height}px`)
      }

      updateHeight()

      const observer = new ResizeObserver(updateHeight)
      observer.observe(localRef.current)

      return () => observer.disconnect()
    }, [])

    // --- set data-scroll attribute ---
    React.useEffect(() => {
      const updateScroll = () => {
        if (alwaysScrolled) {
          document.documentElement.setAttribute('data-scroll', '1')
        } else {
          document.documentElement.setAttribute('data-scroll', window.scrollY === 0 ? '0' : '1')
        }
      }

      updateScroll()
      window.addEventListener('scroll', updateScroll, { passive: true })

      return () => window.removeEventListener('scroll', updateScroll)
    }, [alwaysScrolled])

    return (
      <header
        ref={localRef}
        className={cn(
          'fixed left-0 right-0 top-0 z-10 flex flex-col pb-3 px-3',
          window.isHasNotch ? 'pt-14' : 'pt-5',
          className
        )}
        {...props}
      >
        {children}
      </header>
    )
  }
)

WapperHeader.displayName = 'WapperHeader'
