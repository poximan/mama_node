var port = require("../cfg.json").monitor.port_compras;
var control = require('./ctrlCompras');
var monitor = require('../monitorServ')(port, control);

var io = monitor.io;

// ---------

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {
  monitor.agendarEventos("man");
});
