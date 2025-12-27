import { BaseLayout } from '@/shared/layouts'
import { createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <BaseLayout />
    </>
  )
})
