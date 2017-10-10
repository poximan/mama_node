/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
*/

require('./ctrlCompras');
var mediador = require("../mom/momMediador");
mediador.coleccion("colecc_compras");

// ---------

setInterval(mediador.persistir, 60000);
