import group from './_group.json'

export const groupAbis = {
  admin: group.find((item) => item.name === 'admin'),
  addMember: group.find((item) => item.name === 'addMember'),
  getMyEncryptedGroupKey: group.find((item) => item.name === 'getMyEncryptedGroupKey')
}
