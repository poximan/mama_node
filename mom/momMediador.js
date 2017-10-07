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

    // filtra los que da verdadero
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
