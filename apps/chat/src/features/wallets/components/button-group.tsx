'use client'
import { Button } from '@/shared/components/ui/button'
import { useI18N } from '@/shared/hooks'
import * as React from 'react'
import { ButtonImportWallet, ButtonCreateWallet } from './actions'
import { LoaderCircle } from 'lucide-react'

interface ButtonGroupProps {
  onConnectWallet?: () => void
  isLoading?: boolean
}
function ButtonGroup({ onConnectWallet, isLoading }: ButtonGroupProps) {
  const { t } = useI18N()
  return (
    <div className="grid grid-cols-2 gap-3 pb-6 px-3 md:hidden">
      <ButtonCreateWallet />
      <ButtonImportWallet />
      <Button
        type="button"
        disabled={isLoading}
        className="border-app h-14 col-span-2 rounded-2xl font-bold uppercase bg-black/20 disabled:opacity-60 disabled:pointer-events-none"
        onClick={onConnectWallet}
        aria-busy={isLoading}
        aria-label={t('btn.connectWallet')}
      >
        {isLoading ? <LoaderCircle className="size-5 animate-spin" /> : t('btn.connectWallet')}
      </Button>
    </div>
  )
}

export default React.memo(ButtonGroup)
