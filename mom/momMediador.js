var publicador = require("./momPublicador")();
var bus = require('../eventBus');
var _ = require('underscore');
var unificador = require("./unificador");

/*
.............................................................
... intermediario
.............................................................
*/

// hay que crear carpeta C:\data\db
var MongoClient = require("mongodb").MongoClient;
var mongo_url = require("../cfg.json").mongo.url;

/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
*/
module.exports = function(mi_reloj, coleccion, corte_resp_esperadas) {

  var module = {};

  /*
  ......... reloj vectorial
  */

  /*
  0=serv_compras
  1=serv_envios
  2=serv_infracciones
  3=serv_pagos
  4=serv_publicaciones
  5=serv_web
  */
  var vector = [0, 0, 0, 0, 0, 0];

  module.incrementar = function(){
    vector[mi_reloj]++;
    console.log("INT: reloj " + mi_reloj + ": " + vector);
  }

  function actualizarVector(nuevo_vector){

    var aux_reloj = vector[mi_reloj];

    for (var i = 0; i < vector.length; i++) {
      if(vector[i] < nuevo_vector[i])
        vector[i] = nuevo_vector[i];
    }
    if(aux_reloj < vector[mi_reloj])
      console.error("error en reloj vectorial");
  }

  /*
  ......... persistencia
  */

  var db_global;
  MongoClient.connect(mongo_url, function(err, db) {

    if(err)
      throw err;
    db.createCollection(coleccion);
    db_global = db;
  });

  module.persistir = function() {

    console.log("INT: persistiendo estado");
    var coleccion_obj = db_global.collection(coleccion);

    compras.forEach(function(compra){
      coleccion_obj.update({id:compra.id}, compra, {up:true});
    });
    console.log("INT: estado persistido");
  }

  /*
  ......... eventos
  */

  bus.on("mom", function (msg) {

    actualizarVector(msg.vector);

    if(msg.evento.tarea !== "momResultadoPublicaciones" &&
      msg.evento.tarea !== "momGetPublicaciones" &&
      msg.evento.tarea !== "momCorte")

      agregarCompra(msg.evento);

    /*
    si no se está ejecutando un corte consistente, el mensaje que llega
    desde el canal de comunicaciones se pasa a la capa de negocio

    nota: como caso singular, si no esta ejecutando un corte consistente pero
    este mensaje es el inicio de uno, cuando se coloque en el bus no será
    atrapado por el negocio, sino por un escucha en el mediador que inicaria
    el corte consistente...

    "bus.on("momCorte", function (evento) {});"

    */
    if (typeof registrarActividad !== "function"){
      bus.emit(msg.evento.tarea, msg.evento);
    }
    if (typeof registrarActividad === "function"){
      /*
      si se esta ejecutando un corte consistente, el mensaje no se baja al negocio
      sino que se encola
      */
      registrarActividad("entrante", msg);
    }
  });

  module.publicar = function(reglas_ruteo, evento){

    var msg = {vector, evento};

    if (typeof registrarActividad !== "function" ||
                                        evento.tarea === "momCorte")
      publicador.publicar(reglas_ruteo, msg);
    else {
      registrarActividad("saliente", msg);
    }
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
  var canal_saliente = new Array();

  bus.on("momCorte", function (evento) {

    console.log("ENT: procesando pedido corte consistente");
    module.persistir;

    console.log("INT: ocultando canales de E/S del negocio");
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

  function funcionRegistrar(origen, msg){

    if(origen === "entrante"){

      if(msg.evento.tarea === "momCorte")
        corte_resp_recibidas++;
      canal_entrante.push(msg);
    }

    if(origen === "saliente")
      canal_saliente.push(msg);

    if (corte_resp_recibidas === corte_resp_esperadas){

      var msg = {ent:canal_entrante.slice(0), est:compras.slice(0), sal:canal_saliente.slice(0)};

      console.log("mensajes entrantes -->");
      canal_entrante.forEach(function(actual){

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
      compras.forEach(function(actual){

        var texto = "compra " + actual.id + " => " +
        actual.compra.estado + " : " +
        actual.compra.entrega + " : " +
        actual.compra.reserva + " : " +
        actual.compra.pago + " : " +
        actual.compra.infracciones + " : " +
        actual.compra.medio;

        console.log(texto);
      });

      console.log("mensajes saliente -->");
      console.log(canal_saliente);

      registrarActividad = "no funcion";
      corte_resp_recibidas = 0;
      canal_entrante.length = 0;
      canal_saliente.length = 0;

      console.log("INT: fin corte consistente");
      sock_respuesta.emit("resCorte", msg);
    }
  }

  /*
  ......... negocio (instancias de compras)
  */

  var sock_respuesta;
  module.sockRespuesta = function(socket) {
    sock_respuesta = socket;
  }

  var compras = new Array();

  module.totales = function(){
      return compras;
  }

  var estadisticas = { totales:0, aceptadas:0, canceladas:0, en_curso:0,};
  module.estadisticas = estadisticas;

  setInterval(function() {
    estadisticas.totales = compras.length;
    estadisticas.aceptadas = estadisticas.canceladas = 0;

    compras.forEach(function(evento){

      if(evento.compra.estado === evento.compra.estado_valores[3])
        estadisticas.aceptadas++;
      if(evento.compra.estado === evento.compra.estado_valores[2])
        estadisticas.canceladas++;
      estadisticas.en_curso = estadisticas.totales - estadisticas.aceptadas - estadisticas.canceladas;
    });
  }, 1000);

  module.actualizarAtributo = function(evento){

    var ev_antiguo = aislarEvento(evento);

    var antigua = ev_antiguo.compra;
    var actualizacion = evento.compra;

    actualizacion = unificador.unificar(antigua, actualizacion);
    evento.compra = actualizacion;
    compras.push(evento);

    return evento;
  }

  function aislarEvento(evento){

    var compra = compras.find(function(item, index, array){
      return item.id == evento.id;
    });

    compras = _(compras).filter(function(item) {
      return item.id != evento.id;
    });

    return compra;
  }

  /*
  solo agrega la compra en caso que no exista. no realiza ningun analisis de versiones
  */
  function agregarCompra(evento){
    if(!compras.some(x => x.id === evento.id))
      compras.push(evento);
  }

  return module;
};
