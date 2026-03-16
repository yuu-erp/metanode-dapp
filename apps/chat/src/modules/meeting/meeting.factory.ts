import { MeetingService } from './meeting.service'

export class MeetingFactory {
  static createService() {
    return new MeetingService()
  }
}
