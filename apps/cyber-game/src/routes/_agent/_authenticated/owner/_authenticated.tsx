import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/owner/_authenticated')({
  beforeLoad: ({ context }) => {
    const { user } = context
    if (!user || user.role !== 'OWNER') {
      throw redirect({ to: '/403' })
    }
  },
  component: Outlet
})
