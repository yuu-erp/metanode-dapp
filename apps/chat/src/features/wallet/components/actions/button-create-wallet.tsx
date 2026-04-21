'use client'
import { Button } from '@/shared/components/ui/button'
import { useI18N } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { LoaderCircle } from 'lucide-react'
import * as React from 'react'
import { useOpenCreateWallet } from '../../hooks'

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}
function ButtonCreateWallet({ className, ...props }: Props) {
  const { t } = useI18N()
  const { mutateAsync, isPending } = useOpenCreateWallet()

  const handleCreateWallet = async () => await mutateAsync()

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={handleCreateWallet}
      className={cn(
        'border-app h-14 rounded-2xl font-bold uppercase bg-white/10 disabled:opacity-60 disabled:pointer-events-none',
        className
      )}
      aria-busy={isPending}
      aria-label={t('btn.createWallet')}
      {...props}
    >
      {isPending ? <LoaderCircle className="size-5 animate-spin" /> : t('btn.createWallet')}
    </Button>
  )
}

export default React.memo(ButtonCreateWallet)
