exports.unificar = function(antigua, actualizacion){

  for (var atributo in antigua){
    if (antigua.hasOwnProperty(atributo)){

      /*
      si para una version de la compra {antigua|actualizacion}, existe una valor
      para un atributo pero en la otra version no, es decir, esta vacio ("") ->
      vale esta regla -> COMPLETAR CAMPOS
      */
      if(antigua[atributo] === "" && actualizacion[atributo] !== "")
        antigua[atributo] = actualizacion[atributo];
      else if (antigua[atributo] !== "" && actualizacion[atributo] === "") {
        actualizacion[atributo] = antigua[atributo];
      }
      /*
      si para ambas versiones de la compra {antigua|actualizacion}, existen valores
      para un atributo dado -> vale esta regla -> SUSTITUCION JERARQUICA
      */
      else if (!Array.isArray(antigua[atributo]) &&
      antigua[atributo] !== "" && actualizacion[atributo] !== "") {

        /*
        si se debe decidir sobre el estado de la compra
        {generada|confirmada|cancelada|aceptada}
        */
        if(atributo === "estado"){
          if(antigua.estado === antigua.estado_valores[3])        // aceptada
            actualizacion.estado = antigua.estado;
          if(actualizacion.estado === antigua.estado_valores[3])  // aceptada
            antigua.estado = actualizacion.estado;

          if(antigua.estado === antigua.estado_valores[2])        // cancelada
            actualizacion.estado = antigua.estado;
          if(actualizacion.estado === antigua.estado_valores[2])  // cancelada
            antigua.estado = actualizacion.estado;

          if(antigua.estado === antigua.estado_valores[1])        // confirmada
            actualizacion.estado = antigua.estado;
          if(actualizacion.estado === antigua.estado_valores[1])  // confirmada
            antigua.estado = actualizacion.estado;
        }

        /*
        si se debe decidir sobre la reserva del producto
        {reservado|liberado}
        */
        if(atributo === "reserva"){
          if(antigua.reserva === antigua.reserva_valores[2])        // liberado
            actualizacion.reserva = antigua.reserva;
          if(actualizacion.reserva === antigua.reserva_valores[2])  // liberado
            antigua.reserva = actualizacion.reserva;
        }

        /*
        si se debe decidir sobre el pago de la compra
        {autorizado|liberado}
        */
        if(atributo === "rechazado"){
          if(antigua.pago === antigua.pago_valores[2])        // rechazado
            actualizacion.pago = antigua.pago;
          if(actualizacion.pago === antigua.pago_valores[2])  // rechazado
            antigua.pago = actualizacion.pago;
        }
      }

    }
    else{
      continue;
    }
  }
  return actualizacion;
}
