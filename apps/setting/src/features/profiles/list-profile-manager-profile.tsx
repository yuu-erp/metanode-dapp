'use client'

import ItemProfile from '@/shared/components/item-profile'
import { useGetAllProfile, useGetCurrentProfile, useI18N } from '@/shared/hooks'
import * as React from 'react'
import ButtonMenuProfile from './button-menu-profile.tsx'
import { isVisibleProfile } from '@/shared/utils/index.ts'
function ListProfileManagerProfile() {
  const { t } = useI18N()
  const { data: profiles = [] } = useGetAllProfile()
  const { data: currentProfile } = useGetCurrentProfile()

  const otherProfiles = React.useMemo(() => {
    const visibleProfiles = profiles.filter(isVisibleProfile)

    if (!currentProfile) return visibleProfiles

    return visibleProfiles.filter((p) => p.id !== currentProfile.id)
  }, [profiles, currentProfile])

  return (
    <React.Fragment>
      <div className="flex flex-1">
        <div className="flex flex-col gap-2 w-full h-full">
          {currentProfile && (
            <ItemProfile
              avatarURL={currentProfile.avatar}
              name={currentProfile.name}
              subContent={t('signedIn')}
              className="background-card h-16 rounded-2xl"
              Icon={() => <ButtonMenuProfile isLogin={true} profile={currentProfile} />}
            />
          )}
          {otherProfiles.map((profile) => (
            <ItemProfile
              key={profile.id}
              avatarURL={profile.avatar}
              name={profile.name}
              className="background-card h-16 rounded-2xl"
              Icon={() => <ButtonMenuProfile profile={profile} />}
            />
          ))}
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ListProfileManagerProfile)
