'use client'
import type { Profile } from '@/interfaces'
import DrawerHideProfile from '@/shared/components/drawer-hide-profile'
import {
  useSetPasswordProfile,
  useUpdateProfileIsHidden,
  useUpdateProfileUserName
} from '@/shared/hooks'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface HideProfileState {
  handleHiden: (profile: Profile) => void
  handleUnHiden: (profile: Profile) => void
}

const HideProfileContext = createContext<HideProfileState | undefined>(undefined)

interface HideProfileProviderProps extends React.PropsWithChildren {}

export function HideProfileProvider({ children }: HideProfileProviderProps) {
  const [open, setOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<Profile | null>(null)

  const { setPasswordAsync } = useSetPasswordProfile()
  const { updateProfileUsernameAsync } = useUpdateProfileUserName()
  const { updateProfileIsHiddenAsync, updateProfileIsHidden } = useUpdateProfileIsHidden()
  const openHide = React.useCallback(() => {
    setOpen(true)
  }, [])

  const closeHide = React.useCallback(() => {
    setOpen(false)
  }, [])

  const handleHiden = React.useCallback(async (profile: Profile) => {
    if (!profile.password || !profile.userName) {
      setProfile(profile)
      openHide()
      return
    }
    await updateProfileIsHiddenAsync({ id: profile.id, isHidden: true })
  }, [])

  const handleUnHiden = React.useCallback((profile: Profile) => {
    updateProfileIsHidden({ id: profile.id, isHidden: false })
  }, [])

  const onSubmit = React.useCallback(
    async (value: { password?: string; confirmPassword?: string; username?: string }) => {
      console.log({ value })
      if (!profile) return
      if (value.password && value.confirmPassword) {
        await setPasswordAsync({
          id: profile.id,
          password: value.password,
          passwordConfirm: value.confirmPassword
        })
      }
      if (value.username) {
        await updateProfileUsernameAsync({ id: profile.id, userName: value.username })
      }
      await updateProfileIsHiddenAsync({ id: profile.id, isHidden: true })
    },
    [profile]
  )

  return (
    <HideProfileContext.Provider value={{ handleHiden, handleUnHiden }}>
      {children}
      <DrawerHideProfile
        open={open}
        onClose={closeHide}
        avatarURL={profile?.avatar}
        name={profile?.name}
        isPassowrd={!!profile?.password}
        onSubmit={onSubmit}
      />
    </HideProfileContext.Provider>
  )
}

export function useHideProfileContext() {
  const context = useContext(HideProfileContext)
  if (context === undefined) {
    throw new Error('useHideProfile must be used within an HideProfileProvider')
  }
  return context
}
