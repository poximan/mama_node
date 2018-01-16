/*
param 1 = indice del que es responsable en reloj vectorial
*/
module.exports = function(mi_reloj) {

  var tam_vector = Number(require("../cfg.json").vector_serv.cantidad);

  var module = {};

  /*
  ......... reloj vectorial
  */

  /*
  el tamaño del reloj vectorial se obtiene desde un archivo de configuracion

  0=serv_web
  1=serv_publicaciones
  2=serv_pagos
  3=serv_infracciones
  4=serv_envios
  5=serv_compras
  */
  var vector = new Array(tam_vector).fill(0, 0, tam_vector);

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

  module.actualizarVector = function(nuevo_vector){

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

  return module;
};
