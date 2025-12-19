import ButtonBack from '@/shared/components/button-back'
import { TypographyH1 } from '@/shared/components/typography'
import { useI18N } from '@/shared/hooks'
import ListMenu from '@/shared/partials/list-menu'
import ManagerProfile from '@/shared/partials/manager-profile'
import { exitApp } from '@metanodejs/system-core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent
})

function RouteComponent() {
  const { t } = useI18N()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <TypographyH1 className="text-2xl">{t('settings')}</TypographyH1>
      <ManagerProfile />
      <ListMenu />
      <ButtonBack onBack={exitApp} />
    </div>
  )
}
