import HideAndDelete from '@/features/profiles/hide-and-delete'
import { SettingProfile } from '@/features/setting-profile'
import ButtonBack from '@/shared/components/button-back'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { useGetCurrentProfile } from '@/shared/hooks'
import { getAvatarFallback } from '@/shared/utils'
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Pencil, RefreshCcw } from 'lucide-react'

export const Route = createFileRoute('/_layout/profile-detail')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: profile } = useGetCurrentProfile()

  if (!profile) return <Navigate to="/" />
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <div className="flex justify-end">
        <Button
          className="w-[100px] flex h-12 rounded-full border-app bg-white/40 font-bold"
          onClick={() => navigate({ to: '/manager-profile' })}
        >
          <RefreshCcw className="size-5" />
          <span>Switch</span>
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center gap-5">
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
      <HideAndDelete />
      <SettingProfile />
      <ButtonBack />
    </div>
  )
}
