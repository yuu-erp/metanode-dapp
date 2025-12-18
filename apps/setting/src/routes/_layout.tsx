import {
  createGetAllProfileQueryOptions,
  createGetCurrentProfileQueryOptions,
  createGetMySettingQueryOptions
} from '@/shared/hooks'
import WapperBackground from '@/shared/partials/wapper-background'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/_layout')({
  loader: async ({ context }) => {
    const { queryClient } = context
    await Promise.all([
      queryClient.ensureQueryData(createGetAllProfileQueryOptions()),
      queryClient.ensureQueryData(createGetCurrentProfileQueryOptions()),
      queryClient.ensureQueryData(createGetMySettingQueryOptions())
    ])
    return {}
  },
  component: RouteComponent
})

function RouteComponent() {
  return (
    <React.Fragment>
      <main className={cn('w-screen h-screen z-10', window.isHasNotch ? 'pt-14' : 'pt-12')}>
        <Outlet />
      </main>
      <WapperBackground />
    </React.Fragment>
  )
}
