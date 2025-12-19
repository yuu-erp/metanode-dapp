'use client'
import { useLoginProfileContext } from '@/contexts/login-profile.context'
import { Link, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import ItemProfile from '../components/item-profile'
import { useGetAllProfile, useGetCurrentProfile, useI18N } from '../hooks'
import { isVisibleProfile } from '../utils'

function ManagerProfile() {
  const navigate = useNavigate()
  const { t } = useI18N()
  const { data: profiles = [] } = useGetAllProfile()
  const { data: currentProfile } = useGetCurrentProfile()
  console.log({ profiles })
  const { handleLogin } = useLoginProfileContext()

  const nextProfile = React.useMemo(() => {
    const validProfiles = profiles.filter(isVisibleProfile)

    if (!currentProfile) return validProfiles[0]

    return validProfiles.find((p) => p.id !== currentProfile.id)
  }, [profiles, currentProfile])

  return (
    <React.Fragment>
      <div className="background-card rounded-2xl p-2">
        {currentProfile && (
          <ItemProfile
            avatarURL={currentProfile.avatar}
            name={currentProfile.name}
            subContent={t('signedIn')}
            onClick={() => navigate({ to: '/profile-detail' })}
          />
        )}
        {nextProfile && (
          <ItemProfile
            avatarURL={nextProfile.avatar}
            name={nextProfile.name}
            onClick={() => handleLogin(nextProfile)}
          />
        )}
        <div className="py-2 px-2">
          <div className="h-px w-full bg-white/60"></div>
        </div>
        <div className="flex items-center justify-center text-black/60 text-sm font-semibold py-2">
          <Link to="/manager-profile">
            <span>{t('manageProfile')}</span>
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ManagerProfile)
