'use client'
import type { Profile } from '@/interfaces'
import DrawerDeleteProfile from '@/shared/components/drawer-delete-profile'
import { useDeleteProfileById } from '@/shared/hooks'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface DeleteProfileState {
  handleDeleteProfile: (profile: Profile) => void
}

const DeleteProfileContext = createContext<DeleteProfileState | undefined>(undefined)

interface DeleteProfileProviderProps extends React.PropsWithChildren {}

export function DeleteProfileProvider({ children }: DeleteProfileProviderProps) {
  const [open, setOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<Profile | null>(null)

  const { deleteProfileByIdAsync } = useDeleteProfileById()

  const openHide = React.useCallback(() => {
    setOpen(true)
  }, [])

  const closeHide = React.useCallback(() => {
    setOpen(false)
  }, [])

  const handleDeleteProfile = React.useCallback((profile: Profile) => {
    openHide()
    setProfile(profile)
  }, [])

  const onSubmit = React.useCallback(async () => {
    if (!profile) throw new Error('Profile not found')
    await deleteProfileByIdAsync(profile.id)
  }, [profile])

  return (
    <DeleteProfileContext.Provider value={{ handleDeleteProfile }}>
      {children}
      <DrawerDeleteProfile open={open} onClose={closeHide} onSubmit={onSubmit} />
    </DeleteProfileContext.Provider>
  )
}

export function useDeleteProfileContext() {
  const context = useContext(DeleteProfileContext)
  if (context === undefined) {
    throw new Error('useDeleteProfile must be used within an DeleteProfileProvider')
  }
  return context
}
