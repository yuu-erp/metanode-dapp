'use client'
import * as React from 'react'
import GlassCard from './glass-card'

function SettingsSection() {
  return (
    <React.Fragment>
      <div className="mt-3">
        <GlassCard />
      </div>
    </React.Fragment>
  )
}

export default React.memo(SettingsSection)
