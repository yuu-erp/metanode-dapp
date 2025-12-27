'use client'
import { Button } from '@/shared/components/ui/button'
import { useI18N } from '@/shared/hooks'
import * as React from 'react'

function ButtonGroupMobile() {
  const { t } = useI18N()
  return (
    <div className="grid grid-cols-2 gap-3 pb-6 px-3 md:hidden">
      <Button className="border-app h-14 rounded-xl font-bold uppercase text-md bg-white/10">
        {t('btn.createWallet')}
      </Button>
      <Button className="border-app h-14 rounded-xl font-bold uppercase text-md bg-white/10">
        {t('btn.importWallet')}
      </Button>
      <Button className="border-app h-14 col-span-2 rounded-xl font-bold uppercase text-md bg-black/20">
        {t('btn.connectWallet')}
      </Button>
    </div>
  )
}

export default React.memo(ButtonGroupMobile)
