import ListSharedDapp from '@/features/shared-dapp-of-wallet/list-shared-dapp'
import ButtonBack from '@/shared/components/button-back'
import { TypographyH1 } from '@/shared/components/typography'
import { Button } from '@/shared/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'

export const Route = createFileRoute('/_layout/shared-dapps/')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 text-left text-base leading-tight">
          <TypographyH1 className="text-2xl">Shared D-Apps</TypographyH1>
          <span className="text-muted-foreground truncate text-sm">Manage Sharea D-Apps</span>
        </div>
        <Button
          className="bg-white/40 border-app rounded-full"
          onClick={() => navigate({ to: '/shared-dapps/add' })}
        >
          <Share2 className="size-5 text-white" />
          <span>Shared</span>
        </Button>
      </div>
      <ListSharedDapp />
      <ButtonBack />
    </div>
  )
}
