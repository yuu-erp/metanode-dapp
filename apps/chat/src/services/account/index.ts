import { AccountRepository } from '@/repositories/account.repository'
import { AccountService } from './account.service'

const accountRepo = new AccountRepository()
export const accountService = new AccountService(accountRepo)
