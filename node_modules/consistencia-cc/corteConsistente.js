/*
param 1 = instancia de bus para gestion de eventos
param 2 = lista de suscriptores del servidor dado
param 6 = cantidad de confirmaciones externas para fin corte consistente
param 4 = compras en curso
param 5 = llamada a funcion de persistencia del negocio
param 6 = driver publicador para una arquitectura MOM
param 7 = estado actual del reloj vectorial. se necesita al momento de propagar un corte
*/
module.exports = function(
  bus,
  suscriptores,
  corte_resp_esperadas,
  compras,
  persistir,
  publicador,
  reloj_vectorial
) {

  var module = {};

  /*
  ......... corte consistente
  */

  module.corte_en_proceso = false;

  /*
  numero de respuestas que espera el servidor
  antes de confirmar el fin del algoritmo corte consistente
  */
  var corte_resp_recibidas = 0;

  var canal_entrante = new Array();

  bus.on("momCorte", function (evento) {

    console.log("ENT: procesando pedido corte consistente");
    if(corte_resp_esperadas > 1)
      console.log("INT: se esperan " + corte_resp_esperadas + " respuestas de otros servidores");
    else
      console.log("INT: se espera " + corte_resp_esperadas + " respuesta desde otro servidor");

    module.corte_en_proceso = true;
    persistir();

    // si existen destinatarios
    if(suscriptores !== ""){
      var vector = reloj_vectorial.vector();
      var msg = {vector, evento};
      publicador.publicar(suscriptores, msg);
    }
  });

  var sock_respuesta;
  module.sockRespuesta = function(socket) {
    sock_respuesta = socket;
  }

  module.registrar = function(msg){

    if(msg.evento.tarea === "momCorte")
      corte_resp_recibidas++;
    canal_entrante.push(msg);

    if (corte_resp_recibidas === corte_resp_esperadas){

      module.corte_en_proceso = false;

      console.log("INT: se recibieron " + corte_resp_recibidas + " respuestas de otros servidores");

      var msg = {ent:canal_entrante.slice(0), est:compras().slice(0)};

      corte_resp_recibidas = 0;
      canal_entrante.length = 0;

      console.log("mensajes entrantes -->");
      msg.ent.forEach(function(actual){

        var texto;

        if(actual.evento.tarea === "momCorte")
          texto = actual;
        else {
          texto = "compra " + actual.evento.id + " => " +
          actual.evento.compra.estado + " : " +
          actual.evento.compra.entrega + " : " +
          actual.evento.compra.reserva + " : " +
          actual.evento.compra.pago + " : " +
          actual.evento.compra.infracciones + " : " +
          actual.evento.compra.medio;
        }

        console.log(texto);
      });

      console.log("en memoria -->");
      msg.est.forEach(function(actual){

        var texto = "compra " + actual.id + " => " +
        actual.compra.estado + " : " +
        actual.compra.entrega + " : " +
        actual.compra.reserva + " : " +
        actual.compra.pago + " : " +
        actual.compra.infracciones + " : " +
        actual.compra.medio;

        console.log(texto);
      });
      console.log("INT: fin corte consistente");

      if(sock_respuesta !== undefined)
        sock_respuesta.emit("resCorte", msg);
    }
  }

  return module;
};
