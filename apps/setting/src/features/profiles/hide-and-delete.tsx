'use client'
import { Button } from '@/shared/components/ui/button'
import * as React from 'react'
import { isVisibleProfile } from '@/shared/utils'
import { useDeleteProfileContext } from '@/contexts/delete-profile.context'
import { useHideProfileContext } from '@/contexts/hide-profile.context'
import { useGetCurrentProfile, useI18N } from '@/shared/hooks'

function HideAndDelete() {
  const { t } = useI18N()
  const { data: profile } = useGetCurrentProfile()
  const { handleHiden, handleUnHiden } = useHideProfileContext()
  const { handleDeleteProfile } = useDeleteProfileContext()

  if (!profile) return null
  const isHidden = React.useMemo(() => !isVisibleProfile(profile), [profile])

  const onHiden = React.useCallback(() => {
    handleHiden(profile)
  }, [profile])

  const onUnHiden = React.useCallback(() => {
    handleUnHiden(profile)
  }, [profile])

  const onDelete = React.useCallback(() => {
    handleDeleteProfile(profile)
  }, [profile])
  return (
    <React.Fragment>
      <div className="w-full flex gap-3 mt-3">
        <Button
          className="flex-1 h-10 border-app bg-white/40 font-bold rounded-xl"
          onClick={isHidden ? onUnHiden : onHiden}
        >
          {isHidden ? t('btn.unHide') : t('btn.hide')}
        </Button>
        <Button
          className="flex-1 h-10 border-app bg-white/40 font-bold rounded-xl"
          onClick={onDelete}
        >
          {t('btn.delete')}
        </Button>
      </div>
    </React.Fragment>
  )
}

export default React.memo(HideAndDelete)
