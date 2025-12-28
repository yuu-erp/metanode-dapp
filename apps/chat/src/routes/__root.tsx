import { BaseLayout } from '@/shared/layouts'
import { createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: () => (
    <>
      <BaseLayout />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          classNames: { toast: window.isHasNotch ? 'mt-12' : 'mt-8' },
          style: {
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255, 255, 255, 0.5)'
          }
        }}
      />
    </>
  )
})
