import type { Account } from './account.types'

export type CreateAccountInput = Omit<Account, 'isActive'>

export function createAccount(input: CreateAccountInput): Account {
  assertValidAccount(input)

  return {
    ...input,
    isActive: false
  }
}

export function activateAccount(account: Account): Account {
  return {
    ...account,
    isActive: true
  }
}

export function deactivateAccount(account: Account): Account {
  return {
    ...account,
    isActive: false
  }
}

/* ------------------ */
/* Internal invariants */
/* ------------------ */

function assertValidAccount(input: CreateAccountInput) {
  if (!input.address) {
    throw new Error('Account.address is required')
  }

  if (!input.contractAddress) {
    throw new Error('Account.contractAddress is required')
  }

  if (!input.publicKey) {
    throw new Error('Account.publicKey is required')
  }

  if (!input.username) {
    throw new Error('Account.username is required')
  }

  if (!input.name) {
    throw new Error('Account.name is required')
  }
}
