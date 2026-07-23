'use client'
import { Button } from '@/shared/components/ui/button'
import { useI18N } from '@/shared/hooks'
import type { Wallet } from '@metanodejs/system-core'
import { LoaderCircle } from 'lucide-react'
import * as React from 'react'
import { ButtonCreateWallet, ButtonImportWallet } from './actions'

interface ButtonGroupProps {
  onConnectWallet?: () => void
  isLoading?: boolean
  onCreateWallet?: () => void
  onImportWallet?: () => void
  activeWallet?: Wallet
}
function ButtonGroup({
  onConnectWallet,
  isLoading,
  onCreateWallet,
  onImportWallet
}: ButtonGroupProps) {
  const { t } = useI18N()
  return (
    <React.Fragment>
      {/* Mobile */}
      <div className="grid grid-cols-2 gap-3 pb-6 px-3 xl:grid-cols-3 w-full max-w-4xl mx-auto">
        <ButtonCreateWallet onClick={onCreateWallet} />
        <ButtonImportWallet onClick={onImportWallet} />
        <Button
          type="button"
          disabled={isLoading}
          className="h-12 col-span-2 xl:col-span-1 rounded-2xl font-bold uppercase disabled:opacity-60 disabled:pointer-events-none"
          onClick={onConnectWallet}
          // onClick={()=>{}}
          aria-busy={isLoading}
          aria-label={t('btn.connectWallet')}
        >
          {isLoading ? <LoaderCircle className="size-5 animate-spin" /> : t('btn.connectWallet')}
        </Button>
        {/* <WalletQrButton activeWallet={activeWallet} /> */}
      </div>
    </React.Fragment>
  )
}

export default React.memo(ButtonGroup)
