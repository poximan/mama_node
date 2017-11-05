var port = require("../cfg.json").monitor.port_infracciones;
var control = require('./ctrlInfracciones');
var monitor = require('../monitorServ')(port, control);

var mediador = control.mediador;
var bus = control.bus;
var io = monitor.io;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var probab_infraccion = require("../cfg.json").automatico.probabilidad.infraccion;
var probab_corte_consistente = require("../cfg.json").probabilidad.corte_consistente;

// ---------

setInterval(persistir, periodo_persistencia);

// ---------

bus.on("resultadoInfraccion", function (evento) {
  existeInfraccion(evento);

  evento.tarea = "momResultadoInfraccion";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

existeInfraccion = function(evento) {

  if(probabilidad() <= probab_infraccion)
    evento.compra.infracciones = evento.compra.infracciones_valores[2]; // con_infr
  else
    evento.compra.infracciones = evento.compra.infracciones_valores[1]; // sin_infr
}

/*
al persistirse el estado, solicita con un 50% de probabilidad la
generación de un corte consistente
*/
function persistir(evento) {

  if(!mediador.corteEnProceso())
    if(probabilidad() <= probab_corte_consistente){

      var tarea = "momCorte";
      var evento = {tarea};

      console.log("GLOBAL: comienza corte consistente");
      bus.emit(evento.tarea, evento);
    }
    else {
      mediador.persistir();
    }
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
