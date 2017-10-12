const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('uncaughtException', function (err) {
    console.error("evento desconocido en bus " + err);
});

module.exports = emitter;
