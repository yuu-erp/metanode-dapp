export interface Account {
  address: string
  contractAddress: string

  name: string
  username: string
  publicKey: string

  avatar?: string
  firstName?: string
  lastName?: string
  bio?: string

  isActive: boolean // 🔴 đổi từ isLogin → isActive
  isRegistered?: boolean // 🔹 mới
}
