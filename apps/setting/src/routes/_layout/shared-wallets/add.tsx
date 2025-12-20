import ButtonBack from '@/shared/components/button-back'
import { SearchInput } from '@/shared/components/search-input'
import { TypographyH1 } from '@/shared/components/typography'
import { Button } from '@/shared/components/ui/button'
import { useGetCurrentProfile } from '@/shared/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { Copy } from 'lucide-react'

export const Route = createFileRoute('/_layout/shared-wallets/add')({
  component: RouteComponent
})

function RouteComponent() {
  const { data: profile } = useGetCurrentProfile()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {profile && profile.name ? (
          <Button className="bg-white/40 border-app rounded-full">
            <span>{profile.name}</span>
          </Button>
        ) : (
          <div></div>
        )}
        <Button className="bg-white/40 border-app rounded-full">
          <Copy className="size-5 text-white" />
          <span>Select all</span>
        </Button>
      </div>
      <SearchInput placeholder="Search" />
      <div className="flex items-center justify-between">
        <div className="grid flex-1 text-left text-base leading-tight">
          <TypographyH1 className="text-xl">Choose wallet to shared</TypographyH1>
        </div>
      </div>
      <ButtonBack />
    </div>
  )
}
