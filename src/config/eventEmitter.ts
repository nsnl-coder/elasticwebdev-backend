import EventEmitter from 'events';
import { onUserSignUp } from '../controllers/eventsController';

const eventEmitter = new EventEmitter();
// mail events
const MAIL_EVENTS = {
  USER_SIGN_UP: 'USER_SIGN_UP',
};

eventEmitter.on(MAIL_EVENTS.USER_SIGN_UP, onUserSignUp);

export { eventEmitter, MAIL_EVENTS };
