'use client'
import { useDeleteProfileContext } from '@/contexts/delete-profile.context'
import { useHideProfileContext } from '@/contexts/hide-profile.context'
import { useLoginProfileContext } from '@/contexts/login-profile.context'
import type { Profile } from '@/interfaces'
import ItemMenu from '@/shared/components/item-menu'
import { Drawer, DrawerContent, DrawerTrigger } from '@/shared/components/ui/drawer'
import { useI18N } from '@/shared/hooks'
import { isVisibleProfile } from '@/shared/utils'
import { EllipsisVertical } from 'lucide-react'
import * as React from 'react'

interface ButtonMenuProfileProps {
  isLogin?: boolean
  profile: Profile
}
function ButtonMenuProfile({ isLogin = false, profile }: ButtonMenuProfileProps) {
  const { t } = useI18N()
  const { handleLogin } = useLoginProfileContext()
  const { handleHiden, handleUnHiden } = useHideProfileContext()
  const { handleDeleteProfile } = useDeleteProfileContext()
  const [open, setOpen] = React.useState(false)

  const isHidden = React.useMemo(() => !isVisibleProfile(profile), [profile])
  console.log({ isHidden, profile })
  const onLogin = React.useCallback(() => {
    handleLogin(profile)
    setOpen(false)
  }, [])

  const onHiden = React.useCallback(() => {
    handleHiden(profile)
    setOpen(false)
  }, [])

  const onUnHiden = React.useCallback(() => {
    handleUnHiden(profile)
    setOpen(false)
  }, [])

  const onDelete = React.useCallback(() => {
    handleDeleteProfile(profile)
    setOpen(false)
  }, [])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <EllipsisVertical className="text-black/60 size-5" />
      </DrawerTrigger>
      <DrawerContent className="bg-white/50 pb-5">
        <div className="mx-auto w-full max-w-sm pb-5 px-3 pt-3 flex flex-col gap-2">
          {!isLogin && (
            <ItemMenu
              title={t('btn.login')}
              content={t('btn.loginContent')}
              className="h-14"
              onClick={onLogin}
            />
          )}
          <ItemMenu
            title={isHidden ? t('btn.unHide') : t('btn.hide')}
            content={isHidden ? t('btn.unHideContent') : t('btn.hideContent')}
            className="h-14"
            onClick={isHidden ? onUnHiden : onHiden}
          />
          <ItemMenu
            title={t('btn.delete')}
            content={t('btn.deleteContent')}
            className="h-14"
            onClick={onDelete}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default React.memo(ButtonMenuProfile)
