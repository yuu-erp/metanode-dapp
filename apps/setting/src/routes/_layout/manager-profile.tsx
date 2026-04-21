import { ItemHidenLoginProfile, ListProfileManagerProfile } from '@/features/profiles'
import ButtonBack from '@/shared/components/button-back'
import { TypographyH1 } from '@/shared/components/typography'
import { Button } from '@/shared/components/ui/button'
import { useI18N } from '@/shared/hooks'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/_layout/manager-profile')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { t } = useI18N()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 text-left text-base leading-tight">
          <TypographyH1 className="text-2xl">{t('manageProfile')}</TypographyH1>
          <span className="text-muted-foreground truncate text-sm">{t('chooseYourProfile')}</span>
        </div>
        <Button
          className="size-10 bg-white/40 border-app rounded-full"
          onClick={() => navigate({ to: '/new-profile' })}
        >
          <Plus className="size-5 text-white" />
        </Button>
      </div>
      <div className="grid gap-2">
        <h3 className="font-semibold">{t('otherProfiles')}</h3>
        <ItemHidenLoginProfile />
      </div>
      <div className="grid gap-2">
        <h3 className="font-semibold">{t('switchProfile')}</h3>
        <ListProfileManagerProfile />
      </div>
      <ButtonBack />
    </div>
  )
}
