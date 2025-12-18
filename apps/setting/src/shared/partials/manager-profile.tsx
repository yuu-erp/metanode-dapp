'use client'
import * as React from 'react'
import ItemProfile from '../components/item-profile'
import { useGetAllProfile, useGetCurrentProfile } from '../hooks'
import { Link, useNavigate } from '@tanstack/react-router'
import { useLoginProfileContext } from '@/contexts/login-profile.context'

function ManagerProfile() {
  const navigate = useNavigate()
  const { data: profiles = [] } = useGetAllProfile()
  const { data: currentProfile } = useGetCurrentProfile()

  const { handleLogin } = useLoginProfileContext()

  const nextProfile = React.useMemo(() => {
    if (!currentProfile) return profiles[0]
    return profiles.find((p) => p.id !== currentProfile.id)
  }, [profiles, currentProfile])

  return (
    <React.Fragment>
      <div className="background-card rounded-2xl p-2">
        {currentProfile && (
          <ItemProfile
            avatarURL={currentProfile.avatar}
            name={currentProfile.name}
            subContent="Signin"
            onClick={() =>
              navigate({ to: '/profile/$id', params: { id: String(currentProfile.id) } })
            }
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
        <div className="flex items-center justify-center text-black/60 text-sm font-semibold">
          <Link to="/manager-profile">
            <span>Manager profile</span>
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ManagerProfile)
