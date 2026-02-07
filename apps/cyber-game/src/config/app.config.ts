// Enum cho các môi trường
export enum NodeEnv {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}
// Interface cho App Config
export interface AppConfig {
  nodeEnv: NodeEnv
  RPC_WS_URL: string
}
export const appConfig: AppConfig = {
  nodeEnv: (import.meta.env.VITE_NODE_ENV as NodeEnv) || NodeEnv.DEVELOPMENT,
  RPC_WS_URL: import.meta.env.VITE_RPC_WS_URL
}

export const moneyCurrency = 'VNĐ'

export const nativeLocalKeys = {
  sessionWallet: 'cyber-session-wallet'
}

export const contractConfig = {
  enhancedAgentManagement: import.meta.env.VITE_ENHANCED_AGENT_MANAGEMENT_ADDRESS
}
