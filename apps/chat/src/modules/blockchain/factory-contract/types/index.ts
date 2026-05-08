import type { HistoryVisibility } from '@/modules/conversation'

export interface CheckUserContractInput {
  user: string
}

export interface RegisterUserInput {
  publicKey: string
  userName: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
}

export interface IsUsernameTakenInput {
  _username: string
}

export interface GetUserContractInput {
  user: string
}

export interface CreateGroupInput {
  groupName: string
  groupAvatar: string
  encryptedInitialGroupKey: string
  initialPolicy: number
  _description: string
  _publicKeyAdmin: string
}

export type CreateAnonymousCommunityInput = {
  groupName: string
  groupAvatar: string
  encryptedInitialGroupKey: string
  initialPolicy: HistoryVisibility
  avatarNormal: string
  _globalDefaultAvatar: string
  _publicKeyAdmin: string
}
