var c_compras = require("./conectores/conecCompras").conector;
var c_envios = require("./conectores/conecEnvios").conector;
var c_infracciones = require("./conectores/conecInfracciones").conector;
var c_pagos = require("./conectores/conecPagos").conector;

/*
.............................................................
... variables expuestas
.............................................................
*/

exports.conectores = {c_compras, c_envios, c_infracciones, c_pagos};
