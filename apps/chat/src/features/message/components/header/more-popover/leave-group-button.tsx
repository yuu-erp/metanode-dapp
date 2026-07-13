import { container } from '@/container'
import { useCurrentState } from '@/hooks/use-current-state'
import { getCurrentAccount } from '@/shared/hooks'
import { useAdmin } from '@/shared/hooks/group/use-admin'
import { useGroupInfo } from '@/shared/hooks/group/use-group-info'
import { useLeaveGroup } from '@/shared/hooks/group/use-leave-group'
import { memo } from 'react'
import { PopoverItem } from '../../../../../components/popover-item'

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
        console.log('leave group 1', isAdmin)

        if (isAdmin) {
          let members: any[] = []
          if (base.type === 'group') {
            members = await container.groupContract.getMemberListGroup({
              from: account.hiddenAddress,
              to: base.id
            })
          } else {
            members = await container.anonymousGroupContract.getAllMembers({
              from: account.hiddenAddress,
              to: base.id
            })
          }

          if (members.length === 1) {
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

            const newAdmin = members.filter((item) => item !== account.address)[0]
            const newAdminContractAddress = await container.factoryContract.getUserContract({
              from: account.hiddenAddress,
              inputData: { user: newAdmin }
            })

            const pubKey = await container.userContract.publicKey({
              from: account.hiddenAddress,
              to: newAdminContractAddress
            })
            if (base.type === 'group') {
              await container.groupContract.transferAdmin({
                from: account.hiddenAddress,
                inputData: { _newPublicKeyAdmin: pubKey, newAdmin: newAdmin },
                to: base.id
              })
            } else {
              console.log('leave group 3')
              await container.anonymousGroupContract.transferOwnership({
                from: account.hiddenAddress,
                to: base.id,
                inputData: {
                  _pkAdmin: pubKey,
                  newOwner: newAdmin
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
