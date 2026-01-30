'use client'

import { DEFAULT_CODE } from '@/constants'
import { activeCodeContract } from '@/contract/active-code.contract'
import {
  deleteProfileById,
  getHiddenWallet,
  insertProfile,
  loadMainWithReferralCode,
  writeToLocalStorage
} from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'

const isStoreCode = (code: string): boolean => code === DEFAULT_CODE || code === '99999999'

export async function validateActiveCode({
  activeCode,
  address,
  contractAddress,
  isStore
}: {
  activeCode: string
  address: string
  contractAddress: string
  isStore: boolean
}) {
  if (isStore) return null

  const info = await activeCodeContract.getActiveCodeInfo(address, contractAddress, activeCode)

  if (!info) {
    throw new Error('Active code không tồn tại!')
  }

  return {
    domain: info.infoActive.IP,
    refCode: info.infoActive.refCode,
    installUrl: info.infoCode.installUrl,
    bundleId: info.infoCode.bundleId
  }
}

export async function createProfileAndPersist({
  activeCode,
  isStore
}: {
  activeCode: string
  isStore: boolean
}) {
  const profile = await insertProfile({
    name: 'Guest',
    password: '',
    isHidden: 0,
    avatar: '',
    backgroundImage: '',
    screenSize: `${screen.width}x${screen.height}`
  })

  writeToLocalStorage('is-active-profile', true, '0')
  writeToLocalStorage('refCode', activeCode)
  if (isStore) {
    writeToLocalStorage('isStore', true, '0')
  }

  return profile
}

export async function loadMain({
  dataRef,
  profileId,
  isStore
}: {
  dataRef: any
  profileId: string
  isStore: boolean
}) {
  return loadMainWithReferralCode({
    ...dataRef,
    profileId,
    isStore
  })
}

export function useSubmitActiveCode() {
  return useMutation({
    mutationFn: async ({
      activeCode,
      contractAddress
    }: {
      activeCode: string
      contractAddress: string
    }) => {
      let profile: any

      try {
        const isStore = isStoreCode(activeCode)
        const { address } = await getHiddenWallet()

        // 1. Validate active code
        const codeInfo = await validateActiveCode({
          activeCode,
          address,
          contractAddress,
          isStore
        })

        // 2. Create profile + persist local state
        profile = await createProfileAndPersist({
          activeCode,
          isStore
        })

        // 3. Load main app
        return await loadMain({
          dataRef: codeInfo,
          profileId: profile.id,
          isStore
        })
      } catch (error) {
        // rollback profile nếu đã tạo
        if (profile?.id) {
          await deleteProfileById(profile.id)
        }
        throw error
      }
    },
    onSuccess: () => {
      console.log('✅ Open dapp wallet success!')
    },
    onError: (error) => {
      console.error('❌ Open dapp wallet fail!', error)
    }
  })
}
