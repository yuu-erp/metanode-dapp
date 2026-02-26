import ekyc from './ekyc-contract.json'
import verify from './verify-contract.json'

export const verifyAbis = {
  authenticatedWallets: verify.find((item) => item.name === 'authenticatedWallets')
}

export const ekycAbis = {
  getUser: ekyc.find((item) => item.name === 'getUser')
}
