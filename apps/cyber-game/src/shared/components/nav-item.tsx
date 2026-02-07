'use client'

import { Link, useRouter, useRouterState, type LinkProps } from '@tanstack/react-router'
import * as React from 'react'

interface NavItemProps extends Omit<LinkProps, 'children'> {
  children: (args: { isActive: boolean }) => React.ReactNode
  className?: string
  onClick?: () => void
}

const NavItem: React.FC<NavItemProps> = ({ onClick, children, ...props }) => {
  const router = useRouter()
  const state = useRouterState()

  const currentPath = state.location.pathname

  const targetPath = React.useMemo(() => {
    const built = router.buildLocation(props)
    return built.pathname
  }, [router, props.to, props.params])

  const isActive = React.useMemo(() => targetPath === currentPath, [currentPath, targetPath])

  return (
    <Link {...props} onClick={onClick} className={props.className}>
      {children({ isActive })}
    </Link>
  )
}

export default React.memo(NavItem)
