import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/staff/_authenticated')({
  beforeLoad: ({ context }) => {
    const { user } = context
    if (!user || user.role !== 'STAFF') {
      throw redirect({ to: '/403' })
    }
  },
  component: Outlet
})
