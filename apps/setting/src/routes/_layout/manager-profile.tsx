import { ItemHidenLoginProfile } from '@/features/profiles'
import ButtonBack from '@/shared/components/button-back'
import { TypographyH1 } from '@/shared/components/typography'
import { Button } from '@/shared/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/_layout/manager-profile')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 text-left text-base leading-tight">
          <TypographyH1 className="text-2xl">Manage Profile</TypographyH1>
          <span className="text-muted-foreground truncate text-sm">Choose your profile</span>
        </div>
        <Button
          className="size-10 bg-white/40 border-app rounded-full"
          onClick={() => navigate({ to: '/create-profile' })}
        >
          <Plus className="size-5 text-black/60" />
        </Button>
      </div>
      <div className="grid gap-2">
        <h3 className="font-semibold">Other Profiles</h3>
        <ItemHidenLoginProfile />
      </div>
      <ButtonBack />
    </div>
  )
}
