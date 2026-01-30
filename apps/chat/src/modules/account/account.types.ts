export interface Account {
  address: string
  contractAddress: string
  publicKey: string

  name: string
  username: string

  avatar?: string
  firstName?: string
  lastName?: string
  bio?: string

  isActive: boolean
}
