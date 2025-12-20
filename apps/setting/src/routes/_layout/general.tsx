import { GeneralSetting } from '@/features/setting-profile'
import ButtonBack from '@/shared/components/button-back'
import { TypographyH1 } from '@/shared/components/typography'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/general')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 text-left text-base leading-tight">
          <TypographyH1 className="text-2xl">General</TypographyH1>
          <span className="text-muted-foreground truncate text-sm">
            Choose your mode and language
          </span>
        </div>
      </div>
      <GeneralSetting />
      <ButtonBack />
    </div>
  )
}
