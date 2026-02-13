import { cn } from '@/shared/lib'
import { motion } from 'framer-motion'
import React, { type PropsWithChildren } from 'react'
interface AnimeProps extends PropsWithChildren {
  className?: string
  isOpen?: boolean
}

const Anime = React.forwardRef<HTMLDivElement, AnimeProps>((props, ref) => {
  const { className, children, isOpen } = props

  const variants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  }

  return (
    <React.Fragment>
      <motion.div
        ref={ref}
        className={cn(className)}
        animate={isOpen ? 'open' : 'closed'}
        variants={variants}
        transition={{ ease: 'easeInOut', duration: 0.8 }}
      >
        {children}
      </motion.div>
    </React.Fragment>
  )
})

Anime.displayName = 'Anime'
export default React.memo(Anime)
