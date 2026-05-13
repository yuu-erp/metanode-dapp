export const APP_CONFIG = {
  isDapp: import.meta.env.VITE_IS_DAPP === 'true'
}

export const CONTRACT_ADDRESSES = {
  factory: import.meta.env.VITE_FACTORY || '',
  file: import.meta.env.VITE_FILE || '',
  meeting: import.meta.env.VITE_MEETING || '',
  verify: import.meta.env.VITE_VERIFY || '',
  ekyc: import.meta.env.VITE_EKYC || ''
}

console.log('CONTRACT_ADDRESSES', CONTRACT_ADDRESSES)
