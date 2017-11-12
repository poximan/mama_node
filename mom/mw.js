module.exports = function(
  mi_reloj,     // indice del que es responsable en reloj vectorial
  coleccion,    // coleccion en donde persiten sus documentos este servidor
  corte_resp_esperadas, // cantidad de respuetas que espera para fin corte consistente
  cola_escucha, // nombre de la cola en el servidor de mensajeria
  compras,
  bus,          // bus de escucha para los eventos generados por el eventEmitter
  persistir     // llamada a funcion de persistencia del negocio
) {

  require("./rabbitSuscriptor").suscribir(cola_escucha);
  var publicador = require("./rabbitPublicador")();

  var module = {};

  /*
  ......... reloj vectorial
  */

  /*
  0=serv_web
  1=serv_publicaciones
  2=serv_pagos
  3=serv_infracciones
  4=serv_envios
  5=serv_compras
  */
  var vector = [0, 0, 0, 0, 0, 0];

  module.incrementar = function(){
    vector[mi_reloj]++;
    console.log("INT: reloj " + mi_reloj + ": " + vector);
  }

  module.vector = function(){
    return vector;
  }

  module.indice = function(){
    return mi_reloj;
  }

  function actualizarVector(nuevo_vector){

    var aux_reloj = vector[mi_reloj];

    for (var i = 0; i < vector.length; i++) {
      if(vector[i] < nuevo_vector[i])
        vector[i] = nuevo_vector[i];
    }
    if(aux_reloj < vector[mi_reloj]){
      console.error("Reloj vectorial: otro proceso modifico mi reloj");
      vector[mi_reloj] = aux_reloj;
    }
  }

  /*
  ......... eventos
  */

  bus.on("mom", function (msg) {

    actualizarVector(msg.vector);

    if(msg.evento.tarea !== "momCorte")
      bus.emit("nucleo", msg);
    else {
      if (typeof registrarActividad !== "function")
        bus.emit(msg.evento.tarea, msg.evento);
    }
    if (typeof registrarActividad === "function")
      registrarActividad(msg);
  });

  module.publicar = function(reglas_ruteo, evento){
    var msg = {vector, evento};
    publicador.publicar(reglas_ruteo, msg);
  }

  /*
  ......... corte consistente
  */

  module.corteEnProceso = function() {
    return typeof registrarActividad === "function";
  }

  /*
  numero de respuestas que espera el servidor
  antes de confirmar el fin del algoritmo corte consistente
  */
  var corte_resp_recibidas = 0;

  var registrarActividad = "no funcion";
  var canal_entrante = new Array();

  bus.on("momCorte", function (evento) {

    console.log("ENT: procesando pedido corte consistente");
    persistir();
    registrarActividad = funcionRegistrar;

    switch(coleccion) {
      case "colecc_compras":
          module.publicar("envios.infracciones.pagos.publicaciones.web", evento);
          break;
      case "colecc_envios":
      case "colecc_infracciones":
      case "colecc_pagos":
          module.publicar("compras.publicaciones", evento);
          break;
      case "colecc_web":
          module.publicar("compras", evento);
          break;
      case "colecc_publicaciones":
          break;
      default:
    }
  });

  var sock_respuesta;
  module.sockRespuesta = function(socket) {
    sock_respuesta = socket;
  }

  function funcionRegistrar(msg){

    if(msg.evento.tarea === "momCorte")
      corte_resp_recibidas++;
    canal_entrante.push(msg);

    if (corte_resp_recibidas === corte_resp_esperadas){

      var msg = {ent:canal_entrante.slice(0), est:compras().slice(0)};

      registrarActividad = "no funcion";
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
      sock_respuesta.emit("resCorte", msg);
    }
  }

  return module;
};
