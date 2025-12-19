import { useDeleteProfileContext } from '@/contexts/delete-profile.context'
import { useHideProfileContext } from '@/contexts/hide-profile.context'
import SettingsSection from '@/features/profiles/settings-section/settings-section'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { useGetCurrentProfile, useI18N } from '@/shared/hooks'
import { getAvatarFallback, isVisibleProfile } from '@/shared/utils'
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Pencil, RefreshCcw } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/_layout/profile-detail')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { t } = useI18N()
  const { data: profile } = useGetCurrentProfile()
  const { handleHiden, handleUnHiden } = useHideProfileContext()
  const { handleDeleteProfile } = useDeleteProfileContext()

  if (!profile) return <Navigate to="/" />

  const isHidden = React.useMemo(() => !isVisibleProfile(profile), [profile])

  const onHiden = React.useCallback(() => {
    handleHiden(profile)
  }, [profile])

  const onUnHiden = React.useCallback(() => {
    handleUnHiden(profile)
  }, [profile])

  const onDelete = React.useCallback(() => {
    handleDeleteProfile(profile)
  }, [profile])

  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <Button
        className="w-fix flex h-12 fixed top-14 right-5 rounded-full border-app bg-white/40 font-bold"
        onClick={() => navigate({ to: '/manager-profile' })}
      >
        <RefreshCcw className="size-5" />
        <span>Switch</span>
      </Button>
      <div className="flex flex-col items-center justify-center gap-5 pt-5">
        <div className="relative inline-block">
          <Avatar className="h-28 w-28 rounded-full">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="rounded-lg text-black/60 text-5xl font-bold">
              {getAvatarFallback(profile.name)}
            </AvatarFallback>
          </Avatar>

          <Button className="absolute -bottom-0 -right-0 size-8 rounded-full border-app bg-white/40">
            <Pencil />
          </Button>
        </div>
        <div className="text-center font-bold text-white text-2xl">{profile.name}</div>
      </div>
      <div className="w-full flex gap-3 mt-3">
        <Button
          className="flex-1 h-10 border-app bg-white/40 font-bold rounded-xl"
          onClick={isHidden ? onUnHiden : onHiden}
        >
          {isHidden ? t('btn.unHide') : t('btn.hide')}
        </Button>
        <Button
          className="flex-1 h-10 border-app bg-white/40 font-bold rounded-xl"
          onClick={onDelete}
        >
          {t('btn.delete')}
        </Button>
      </div>
      <SettingsSection />
    </div>
  )
}
