'use client'
import type { Profile } from '@/interfaces'
import DrawerEnterPassword from '@/shared/components/drawer-enter-password'
import { useLoginProfile, useSwitchProfile } from '@/shared/hooks'
import * as React from 'react'
import { createContext, useContext } from 'react'
export interface LoginProfileState {
  handleLogin: (profile: Profile) => void
}

const LoginProfileContext = createContext<LoginProfileState | undefined>(undefined)

interface LoginProfileProviderProps extends React.PropsWithChildren {}

export function LoginProfileProvider({ children }: LoginProfileProviderProps) {
  const [open, setOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<Profile | null>(null)

  const { switchProfileAsync } = useSwitchProfile()
  const { loginAsync } = useLoginProfile()

  const openLogin = React.useCallback(() => {
    setOpen(true)
  }, [])

  const closeLogin = React.useCallback(() => {
    setOpen(false)
  }, [])

  const handleLogin = React.useCallback(async (profile: Profile) => {
    console.log('handleLogin', profile)
    if (profile.password) {
      openLogin()
      setProfile(profile)
      return
    }
    await switchProfileAsync({ id: profile.id })
  }, [])

  const handleLoginProfilePassword = React.useCallback(
    async (password: string) => {
      if (!profile) return
      await loginAsync({ id: profile.id, password })
      setProfile(null)
    },
    [profile]
  )
  return (
    <LoginProfileContext.Provider value={{ handleLogin }}>
      {children}
      <DrawerEnterPassword
        open={open}
        onClose={closeLogin}
        avatarURL={profile?.avatar}
        name={profile?.name}
        onSubmit={handleLoginProfilePassword}
      />
    </LoginProfileContext.Provider>
  )
}

export function useLoginProfileContext() {
  const context = useContext(LoginProfileContext)
  if (context === undefined) {
    throw new Error('useLoginProfile must be used within an LoginProfileProvider')
  }
  return context
}
