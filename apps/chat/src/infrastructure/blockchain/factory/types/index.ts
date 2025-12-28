export interface CheckUserContractInput {
  user: string
}

export interface RegisterUserInput {
  publicKey: string
  userName: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
}

export interface IsUsernameTakenInput {
  _username: string
}

export interface GetUserContractInput {
  user: string
}
