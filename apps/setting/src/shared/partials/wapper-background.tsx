'use client'
import * as React from 'react'
import Background from '../components/background'
import { useGetCurrentProfile } from '../hooks'

function WapperBackground() {
  const { data: profile } = useGetCurrentProfile()
  return <Background backgroundUrl={profile?.backgroundImage} />
}

export default React.memo(WapperBackground)
