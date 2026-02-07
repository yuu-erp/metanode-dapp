import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/manager/_authenticated')({
  beforeLoad: ({ context }) => {
    const { user } = context
    if (!user || user.role !== 'MANAGER') {
      throw redirect({ to: '/403' })
    }
  },
  component: Outlet
})
