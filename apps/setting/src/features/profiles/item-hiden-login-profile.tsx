'use client'
import ItemProfile from '@/shared/components/item-profile'
import { HatGlasses } from 'lucide-react'
import * as React from 'react'

function ItemHidenLoginProfile() {
  return (
    <React.Fragment>
      <ItemProfile
        AvatarIcon={HatGlasses}
        name="Login with hidden profile"
        className="background-card h-16 rounded-2xl"
      />
    </React.Fragment>
  )
}

export default React.memo(ItemHidenLoginProfile)
