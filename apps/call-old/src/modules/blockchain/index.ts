import { MeetingContract } from './meeting-contract'

export class Blockchain {
  meeting = new MeetingContract()
}

export const blockchain = new Blockchain()
