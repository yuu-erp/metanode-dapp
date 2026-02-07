export type Role = 'OWNER' | 'MANAGER' | 'STAFF' | 'USER'

export interface User {
  id: string
  name: string
  avatar?: string
  role: Role
  balance: number
  address: string
}
