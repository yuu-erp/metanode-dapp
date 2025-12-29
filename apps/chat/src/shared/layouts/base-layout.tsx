'use client'
import { Outlet } from '@tanstack/react-router'
import * as React from 'react'
import Background from '../components/background'
import { cn } from '../lib'

export function BaseLayout() {
  return (
    <React.Fragment>
      <main className={cn('w-full h-full min-h-full flex-1')}>
        <Outlet />
      </main>
      <Background />
    </React.Fragment>
  )
}
