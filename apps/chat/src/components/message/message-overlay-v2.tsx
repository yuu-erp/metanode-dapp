import { AnimatePresence, motion } from 'framer-motion'
import React, { memo, type FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useOverlayPosition } from '@/hooks/use-overlay-position'
import { useCurrentMessageById } from '@/new/message'
import { cn } from '@/shared/lib'
import { modalActions, useModalStore } from '@/stores/modal.store'
import { CopyOverlay } from './overlay-items/copy.overlay'
import { DeleteOverlay } from './overlay-items/delete.overlay'
import { EditOverlay } from './overlay-items/edit.overlay'
import { ForwardOverlay } from './overlay-items/forward.overlay'
import { PinOverlay } from './overlay-items/pin.overlay'
import { ReplyOverlay } from './overlay-items/reply.overlay'
import { SaveOverlay } from './overlay-items/save.overlay'
import { ReactionItem } from './reaction/reaction-item'
import type { WithMessage } from './types'

export type MessageOverlayV2Props = {}

const quickReactions = ['❤️', '😢', '😂', '👍', '👎', '🔥', '🥰']

const Comps = [
  ReplyOverlay,
  CopyOverlay,
  SaveOverlay,
  EditOverlay,
  PinOverlay,
  ForwardOverlay,
  DeleteOverlay
] as FC<WithMessage>[]

export const MessageOverlayV2 = memo(() => {
  const backdropRef = React.useRef<HTMLDivElement>(null)

  const { open, meta } = useModalStore(
    useShallow((s) => ({
      open: s.open && s.kind === 'overlay',
      meta: s.meta
    }))
  )

  const { x, y, id } = meta ?? {}

  const { contentRef, position } = useOverlayPosition({
    x,
    y
  })

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.target === backdropRef.current) {
      modalActions.close()
    }
  }

  const { data } = useCurrentMessageById(id)

  return (
    <AnimatePresence>
      {!!data && open && (
        <motion.div
          ref={backdropRef}
          className="fixed inset-0 z-50 bg-black/60"
          onClick={handleBackdropClick}
          onContextMenu={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.18
          }}
        >
          <motion.div
            ref={contentRef}
            data-name="content"
            className="absolute w-min pointer-events-auto"
            style={position}
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.9
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320
            }}
          >
            <div
              className={cn(
                'mb-3 w-fit rounded-full bg-white/80 px-2 py-1',
                'flex gap-3 shadow-xl backdrop-blur-md-app'
              )}
            >
              {quickReactions.map((emoji) => (
                <ReactionItem key={emoji} reaction={emoji} messageId={id} />
              ))}
            </div>

            <div className="rounded-2xl bg-white/80 p-3 shadow-2xl">
              {Comps.map((Comp, i) => (
                <React.Fragment key={i}>
                  <div onClick={modalActions.close}>
                    <Comp data={data} />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

MessageOverlayV2.displayName = 'MessageOverlayV2'
