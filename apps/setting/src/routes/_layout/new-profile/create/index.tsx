import ButtonFooter from '@/shared/components/button-footer'
import { TypographyH1 } from '@/shared/components/typography'
import { Input } from '@/shared/components/ui/input'
import { useI18N } from '@/shared/hooks'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/new-profile/create/')({
  component: RouteComponent
})

function RouteComponent() {
  const router = useRouter()
  const { t } = useI18N()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <TypographyH1 className="text-2xl">Create a profile</TypographyH1>
      <div className="flex-1">
        <Input
          placeholder="Enter your name"
          className="bg-white/80 border-app text-black/60 rounded-xl"
        />
      </div>
      <ButtonFooter onBack={() => router.history.back()} btnContent={t('continue')} />
    </div>
  )
}
