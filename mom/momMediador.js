var bus = require('../eventBus');
var _ = require("underscore");

/*
.............................................................
... intermediario
.............................................................
*/

var compras = new Array();

bus.on("mom", function (evento) {

  if(evento.id !== ""){

    /*
    crea un nuevo array con todos los elementos
    que cumplan la condición implementada por la función dada.
    */
    compras = compras.filter(function(item) {
        return item.id !== evento.id;
    })
    compras.push(evento);
  }

  bus.emit(evento.tarea, evento);
});

exports.persistir = function() {
  console.log("aca se persiste el estado");
}
