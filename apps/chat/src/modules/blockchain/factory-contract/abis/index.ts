import { checkUserContract } from './check-user-contract.abi'
import { createGroup } from './create-group.abi'
import { getUserContract } from './get-user-contract.abi'
import { isUsernameTaken } from './is-username-taken.abi'
import { registerUser } from './register-user.abi'
import factoryContract from './factory-contract.json'

export const factoryAbi = {
  checkUserContract,
  registerUser,
  isUsernameTaken,
  getUserContract,
  createGroup,
  createAnonymousCommunity: factoryContract.find(
    (item) => item.name === 'createAnonymousCommunity'
  ) as any
}

export { factoryContract }
