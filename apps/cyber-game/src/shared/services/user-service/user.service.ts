import type { User } from '@/shared/types/user'
// import { readFromLocalStorage } from "@metanodejs/system-core"

export class UserService {
  private static instance: UserService
  // private KEY_LOCAL_NATIVE: string = 'meos_user'

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  // private async getAddressUser(): Promise<string | null> {
  //     const address = await readFromLocalStorage(this.KEY_LOCAL_NATIVE)
  //     return address as string | null
  // }

  public async initialize(): Promise<User> {
    // const address = await this.getAddressUser()
    // if (!address) {
    //     throw new Error("Address not found")
    // }

    return {
      address: '0x1234567890123456789012345678901234567890',
      id: '1',
      name: 'Admin',
      role: 'MANAGER',
      balance: 0
    }
  }
}
