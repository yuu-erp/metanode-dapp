import ButtonBack from '@/shared/components/button-back'
import { TypographyH1 } from '@/shared/components/typography'
import ListMenu from '@/shared/partials/list-menu'
import ManagerProfile from '@/shared/partials/manager-profile'
import { exitApp } from '@metanodejs/system-core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <TypographyH1 className="uppercase text-2xl">Setting</TypographyH1>
      <ManagerProfile />
      <ListMenu />
      <ButtonBack onBack={exitApp} />
    </div>
  )
}
