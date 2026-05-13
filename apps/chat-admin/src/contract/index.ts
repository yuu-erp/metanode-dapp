import { ContractClient } from './contract-client'
import type {
  RegistryHandlers,
  WithExecutor,
  WithPagination,
  WithPaginationResult,
  WithUser
} from './types'

export const contractClient = new ContractClient()
export const methods = contractClient.methods as RegistryHandlers<{
  factory: {
    isAdminExecutor: [WithExecutor, boolean]
    admin: [{}, string]
    appointAdminExecutor: [WithExecutor, void]
    revokeAdminExecutor: [WithExecutor, void]
    getAllAdminExecutors: [WithPagination, WithPaginationResult<{ executors: string[] }>]
    getAllDisabledUsers: [WithPagination, WithPaginationResult<{ users: string[] }>]
    getAllUsers: [WithPagination, WithPaginationResult<{ usersData: string[] }>]
    getUserContract: [WithUser, string]
    isUserDisabled: [WithUser, boolean]
    disableUser: [{ userToDisable: string }, void]
    enableUser: [{ userToEnable: string }, void]
    changeAdmin: [{ newAdmin: string }, void]
    adminExecutorAppointedAt: [{ '': string }, string]
    userDisabledAt: [{ '': string }, string]
    userRegisteredAt: [{ '': string }, string]
  }
  user: {
    getUserProfile: [
      {},
      {
        userName: string
        firstName: string
        lastName: string
        avatar: string
        bio: string
      }
    ]
  }
}>
