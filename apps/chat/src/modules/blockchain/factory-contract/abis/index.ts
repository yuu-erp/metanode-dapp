import { checkUserContract } from './check-user-contract.abi'
import { getUserContract } from './get-user-contract.abi'
import { isUsernameTaken } from './is-username-taken.abi'
import { registerUser } from './register-user.abi'

export const factoryAbi = {
  checkUserContract,
  registerUser,
  isUsernameTaken,
  getUserContract
}
