'use client'
import { Button } from '@/shared/components/ui/button'
import { useI18N } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import * as React from 'react'
import { useOpenImportWallet } from '../../hooks'
import { LoaderCircle } from 'lucide-react'

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}
function ButtonImportWallet({ className, ...props }: Props) {
  const { t } = useI18N()
  const { mutateAsync, isPending } = useOpenImportWallet()

  const handleImportWallet = async () => await mutateAsync()

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={handleImportWallet}
      className={cn(
        'border-app h-14 rounded-2xl font-bold uppercase bg-white/10 disabled:opacity-60 disabled:pointer-events-none',
        className
      )}
      aria-busy={isPending}
      aria-label={t('btn.importWallet')}
      {...props}
    >
      {isPending ? <LoaderCircle className="size-5 animate-spin" /> : t('btn.importWallet')}
    </Button>
  )
}

export default React.memo(ButtonImportWallet)
