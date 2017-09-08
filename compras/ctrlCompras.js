var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

bus.on("nuevaCompra", function (evento) {

  evento.data.compra.estado = evento.data.compra.estados[0]; // generada

  console.log("\ndelegando calculos de compra " + evento.id + " ");
  evento.tarea = "publicacionSeleccionada";
  publicador("infracciones.web.ventas", evento)
});

bus.on("resultadoInfraccion", function (evento) {
  console.log("resultado infraccion compra " + evento.id + " --> " + evento.data.publicacion.infracciones.estado);
})

bus.on("resultadoEnvio", function (evento) {
  console.log("resultado envio compra " + evento.id + " --> " + evento.data.compra.entrega.estado);

  // si el cliente elige metodo de envio correo
  if(evento.data.compra.entrega.estado === evento.data.compra.entrega.estados[2]){

    evento.tarea = "calcularCosto";
    bus.emit(evento.tarea, evento);
  }
})

bus.on("calcularCosto", function (evento) {
  publicador("envios", evento)
})

bus.on("resultadoCosto", function (evento) {
  console.log("resultado costo compra " + evento.id + " --> " + evento.data.compra.adic_envio.valor);
});
