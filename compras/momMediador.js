var bus = require('../eventBus');
var _ = require("underscore");

/*
.............................................................
... intermediario
.............................................................
*/

var id = 1;
var compras = new Array();
var compra;

bus.on("mom", function (evento) {

  compra = _.find(compras,function (compra_actual) {
    return compra_actual.id == evento.id;
  });

  if (!compra) {
    evento.id = id++;
    compras.push(evento);
  }

  bus.emit(evento.tarea, evento);
});

exports.persistir = function() {
  console.log("aca se persiste el estado");
}
