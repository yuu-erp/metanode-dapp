import { container } from '@/container'
import { getGroupMembers } from '@/features/conversation'
import { useCurrentState } from '@/hooks/use-current-state'
import { useAdmin } from '@/shared/hooks/group/use-admin'
import { useGroupInfo } from '@/shared/hooks/group/use-group-info'
import { useLeaveGroup } from '@/shared/hooks/group/use-leave-group'
import { memo } from 'react'
import { PopoverItem } from '../../../../../components/popover-item'
import { getCurrentAccount } from '@/shared/hooks'

export type LeaveGroupButtonProps = {
  onClose?: () => void
}

export const LeaveGroupButton = memo(({ onClose }: LeaveGroupButtonProps) => {
  const { isGroup } = useGroupInfo()
  const { mutate: leaveGroup } = useLeaveGroup()
  const { isAdmin } = useAdmin()
  const { base } = useCurrentState()

  if (!isGroup) return null

  return (
    <PopoverItem
      onClick={async () => {
        onClose?.()
        const account = await getCurrentAccount()
        console.log('leave group 1')

        if (isAdmin) {
          const members = await getGroupMembers(base)
          const others = members.filter((i) => i.contractAddress !== account?.contractAddress)
          if (!others.length) {
            //delete group
            if (base.type === 'group') {
              const groupId = await container.groupContract.groupId({
                from: account!.hiddenAddress,
                to: base.id
              })

              await container.factoryContract.deleteGroup({
                from: account!.hiddenAddress,
                inputData: {
                  groupId
                }
              })
            } else {
              await container.factoryContract.deleteAnonymousCommunity({
                from: account!.hiddenAddress,
                inputData: {
                  groupToDelete: base.id
                }
              })
            }
          } else {
            //transfer
            console.log('leave group 2')

            const newAdmin = others[0]
            const pubKey = await container.userContract.publicKey({
              from: account.hiddenAddress,
              to: newAdmin.contractAddress
            })
            if (base.type === 'group') {
              await container.groupContract.transferAdmin({
                from: account.hiddenAddress,
                inputData: { _newPublicKeyAdmin: pubKey, newAdmin: newAdmin.address },
                to: base.id
              })
            } else {
              console.log('leave group 3')
              await container.anonymousGroupContract.transferOwnership({
                from: account.hiddenAddress,
                to: base.id,
                inputData: {
                  _pkAdmin: pubKey,
                  newOwner: newAdmin.address
                }
              })
            }
          }

          // uiActions.setLeaveGroupOpen(true)
        }
        leaveGroup()
      }}
    >
      Leave group
    </PopoverItem>
  )
})
