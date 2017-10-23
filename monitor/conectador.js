var c_compras = require("./conectores/conecCompras").conector;
var c_envios = require("./conectores/conecEnvios").conector;
var c_infracciones = require("./conectores/conecInfracciones").conector;
var c_pagos = require("./conectores/conecPagos").conector;
var c_publicaciones = require("./conectores/conecPublicaciones").conector;
var c_web = require("./conectores/conecWeb").conector;

/*
.............................................................
... variables expuestas
.............................................................
*/

exports.conectores = {c_compras, c_envios, c_infracciones, c_pagos, c_publicaciones, c_web};
