// Enum cho các môi trường
export enum NodeEnv {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}
// Interface cho App Config
export interface AppConfig {
  nodeEnv: NodeEnv
}
export const appConfig: AppConfig = {
  nodeEnv: (import.meta.env.VITE_NODE_ENV as NodeEnv) || NodeEnv.DEVELOPMENT
}
