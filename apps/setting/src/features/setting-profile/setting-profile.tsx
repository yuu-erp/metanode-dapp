'use client'
import * as React from 'react'
import {
  DecentralizedApplications,
  FaceIDTouchID,
  HiddenPincode,
  LockPassword,
  NumberOfWallets,
  Password,
  ProtectProfile,
  SmartContracts,
  WhiteList
} from './actions'
import WapperSetting from '@/shared/components/wapper-setting'

function SettingProfile() {
  return (
    <div className="mt-3 flex flex-col gap-3 pb-24">
      <WapperSetting>
        <NumberOfWallets />
        <WhiteList />
      </WapperSetting>
      <WapperSetting>
        <DecentralizedApplications />
        <SmartContracts />
      </WapperSetting>
      <div className="grid gap-2">
        <p className="font-semibold">Private Security</p>
        <WapperSetting>
          <FaceIDTouchID />
          <Password />
          <ProtectProfile />
        </WapperSetting>
      </div>
      <div className="grid gap-2">
        <p className="font-semibold">D-app</p>
        <WapperSetting>
          <HiddenPincode />
          <LockPassword />
        </WapperSetting>
      </div>
    </div>
  )
}

export default React.memo(SettingProfile)
