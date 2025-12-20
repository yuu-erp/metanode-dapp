import { Language } from '@/features/setting-profile/actions'
import ButtonFooter from '@/shared/components/button-footer'
import ItemSetting from '@/shared/components/item-setting'
import { TypographyH1 } from '@/shared/components/typography'
import WapperSetting from '@/shared/components/wapper-setting'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/_layout/node')({
  component: RouteComponent
})

function RouteComponent() {
  const router = useRouter()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="grid flex-1 text-left text-base leading-tight">
          <TypographyH1 className="text-2xl">Choose node</TypographyH1>
          <span className="text-muted-foreground truncate text-sm">
            Select a node to connect to the blockchain network
          </span>
        </div>
      </div>
      <div className="flex-1">
        <div className="grid gap-2">
          <p className="font-semibold">Choose a node</p>
          <WapperSetting>
            <ItemSetting
              title="34.124.142.148:4200"
              rightNode={
                <div className="flex items-center gap-1 text-muted-foreground text-sm font-semibold">
                  <ChevronRight className="size-5" />
                </div>
              }
            />
          </WapperSetting>
        </div>
      </div>
      <ButtonFooter onBack={() => router.history.back()} btnContent="Connect" />
    </div>
  )
}
