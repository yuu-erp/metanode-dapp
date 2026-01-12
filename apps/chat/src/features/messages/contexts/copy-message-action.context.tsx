'use client'
import { cn } from '@/shared/lib'
import { copyClipboard } from '@metanodejs/system-core'
import { Copy } from 'lucide-react'
import * as React from 'react'
import { createContext, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface CopyMessageActionState {
  copyMessage: (content: string) => Promise<void>
}

const CopyMessageActionContext = createContext<CopyMessageActionState | undefined>(undefined)

interface CopyMessageActionProviderProps extends React.PropsWithChildren {}

export function CopyMessageActionProvider({ children }: CopyMessageActionProviderProps) {
  const [visible, setVisible] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const copyMessage = React.useCallback(async (content: string) => {
    if (!content) return

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content)
    } else {
      await copyClipboard(content)
    }

    setVisible(true)

    // clear timer cũ để tránh spam copy
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setVisible(false)
    }, 3000)
  }, [])

  return (
    <CopyMessageActionContext.Provider value={{ copyMessage }}>
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{
              duration: 0.25,
              ease: 'easeOut'
            }}
            className={cn('fixed bottom-22 left-1/2 z-50 -translate-x-1/2 px-2 w-full')}
          >
            <div className="mx-auto w-fit p-3 px-4 bg-black/40 backdrop-filter-app flex items-center gap-3 rounded-full text-white">
              <Copy className="size-5" />
              Message Copied to clipboard
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CopyMessageActionContext.Provider>
  )
}

export function useCopyMessageAction() {
  const context = useContext(CopyMessageActionContext)
  if (!context) {
    throw new Error('useCopyMessageAction must be used within CopyMessageActionProvider')
  }
  return context
}
