import type { TransactionPayload } from '../type'
import type {
  CheckUserContractInput,
  GetUserContractInput,
  IsUsernameTakenInput,
  RegisterUserInput
} from './types'

export interface FactoryContract {
  checkUserContract(payload: TransactionPayload<CheckUserContractInput>): Promise<boolean>
  registerUser(payload: TransactionPayload<RegisterUserInput>): Promise<void>
  isUsernameTaken(payload: TransactionPayload<IsUsernameTakenInput>): Promise<boolean>
  getUserContract(payload: TransactionPayload<GetUserContractInput>): Promise<string>
}
