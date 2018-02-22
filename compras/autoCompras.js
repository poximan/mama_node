var port = require("../propiedades.json").monitor.port_compras;
var control = require('./ctrlCompras');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

require("../autoComun")(control.nucleo, bus);

/*
.............................................................
... respuestas simuladas
.............................................................
*/


/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {
  monitor.agendarEventos("auto");
});
