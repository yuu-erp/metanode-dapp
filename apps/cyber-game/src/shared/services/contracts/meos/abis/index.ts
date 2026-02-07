import abi from './abi.json'

export const meosABI = {
  getAllDeployedContracts: abi.find((item) => item.name === 'getAllDeployedContracts')
}
