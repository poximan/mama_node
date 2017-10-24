var publicador = require("./momPublicador");
var bus = require('../eventBus');
var _ = require('lodash');

/*
.............................................................
... intermediario
.............................................................
*/

// hay que crear carpeta C:\data\db
var MongoClient = require('mongodb').MongoClient;
var mongo_url = require("../cfg.json").mongo.url;

var instancia_db;
var coleccion;

var compras = new Array();
exports.compras = compras;

exports.estadisticas = { totales:1, aceptadas:0, rechazadas:0, en_curso:0,};


/*
0=serv_compras
1=serv_envios
2=serv_infracciones
3=serv_pagos
4=serv_publicaciones
5=serv_web
*/
var vector = [0, 0, 0, 0, 0, 0];
var mi_reloj = 0;

/*
......... reloj vectorial
*/

exports.indice = function(indice) {
  mi_reloj = indice;
}

exports.incrementar = function(){
  vector[mi_reloj]++;
  console.log("INT: reloj " + mi_reloj + ": " + vector);
}

/*
......... persistencia
*/

exports.coleccion = function(nombre_coleccion) {
  coleccion = nombre_coleccion;
}

/*
......... eventos
*/

bus.on("mom", function (msg) {

  actualizarVector(msg.vector);

  if(msg.evento.tarea !== "momResultadoPublicaciones" &&
    msg.evento.tarea !== "momGetPublicaciones"){

    var picked = _.filter(compras, { 'id': msg.evento.id } );

    if(picked.length > 0)
      msg.evento = merge(msg.evento, picked[0]);

    compras.push(msg.evento);
  }
  bus.emit(msg.evento.tarea, msg.evento);
});

exports.persistir = function() {
  console.log("persistiendo");
}

exports.publicar = function(reglas_ruteo, evento){

  var msg = {vector, evento};
  publicador.publicar(reglas_ruteo, msg);
}

function merge(actualizacion, anterior){

  if(actualizacion.estado === "")
    actualizacion.estado = anterior.estado;

  if(actualizacion.entrega === "")
    actualizacion.entrega = anterior.entrega;

  if(actualizacion.reserva === "")
    actualizacion.reserva = anterior.reserva;

  if(actualizacion.pago === "")
    actualizacion.pago = anterior.pago;

  if(actualizacion.infracciones === "")
    actualizacion.infracciones = anterior.infracciones;

  if(actualizacion.medio === "")
    actualizacion.medio = anterior.medio;

  return actualizacion;
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
