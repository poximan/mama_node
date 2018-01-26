var port = require("../globalCfg.json").monitor.port_publicaciones;
var control = require('./ctrlPublicaciones');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

require("../autoComun")(control.nucleo, bus);

// ---------

bus.on("resultadoStock", function (publicacion) {
  publicacion.cantidad = cantidad();
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

cantidad = function() {
  return Math.ceil(probabilidad()/10);
}

function probabilidad() {
  return Math.random() * 100;
}

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {
  monitor.agendarEventos("auto");
});
