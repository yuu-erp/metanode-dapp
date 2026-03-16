import { MeetingContract } from './meeting-contract'

export type Blockchain = typeof blockchain

export const blockchain = {
  meeting: new MeetingContract()
}
