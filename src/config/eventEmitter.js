const EventEmitter = require('events');
const {
  onUserSignUp,
  onForgotPassword,
} = require('../controllers/eventsController');

const eventEmitter = new EventEmitter();
// mail events
const MAIL_EVENTS = {
  USER_SIGN_UP: 'USER_SIGN_UP',
};

eventEmitter.on(MAIL_EVENTS.USER_SIGN_UP, onUserSignUp);

module.exports = { eventEmitter, MAIL_EVENTS };
