import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@bsstickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
