var publicador = require("./momPublicador");
var bus = require('../eventBus');
var _ = require('underscore');

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
exports.totales = compras;

var estadisticas = { totales:0, aceptadas:0, canceladas:0, en_curso:0,};
exports.estadisticas = estadisticas;

setInterval ( function() {
  estadisticas.totales = compras.length;

  compras.forEach(function(evento){
    if(evento.compra.estado === evento.compra.estados[3])
      estadisticas.aceptadas++;
    if(evento.compra.estado === evento.compra.estados[2])
      estadisticas.canceladas++;
    estadisticas.en_curso = estadisticas.totales - estadisticas.aceptadas - estadisticas.canceladas;
  });
}, 2000);

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
    msg.evento.tarea !== "momGetPublicaciones")

      actualizarMensaje(msg.evento);

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

  if(actualizacion.compra.estado === "")
    actualizacion.compra.estado = anterior.compra.estado;

  if(actualizacion.compra.entrega === "")
    actualizacion.compra.entrega = anterior.compra.entrega;

  if(actualizacion.compra.reserva === "")
    actualizacion.compra.reserva = anterior.compra.reserva;

  if(actualizacion.compra.pago === "")
    actualizacion.compra.pago = anterior.compra.pago;

  if(actualizacion.compra.infracciones === "")
    actualizacion.compra.infracciones = anterior.compra.infracciones;

  if(actualizacion.compra.medio === "")
    actualizacion.compra.medio = anterior.compra.medio;

  return actualizacion;
}

function actualizarMensaje(evento){

  var coincidencia = buscarEvento(evento);
  if(coincidencia !== undefined)
    evento = merge(evento, coincidencia);

  compras.push(evento);
}

function buscarEvento(evento){

  var compra = compras.find(function(element, index, array){
    return element.id == evento.id;
  });

  if(compra)
    compras = _(compras).filter(function(item) {
      return item.id != evento.id;
    });

  return compra;
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
