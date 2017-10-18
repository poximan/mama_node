var net = require('net');

exports.conexiones = {serv_web, serv_publicaciones, serv_pagos, serv_infracciones, serv_envios, serv_compras);

/*
.............................................................
... conexion a servidor web
.............................................................
*/

var ip_web = require("../cfg.json").manual.monitor.ip_web;
var p_web = require("../cfg.json").manual.monitor.port_web;

var serv_web = new net.Socket();
serv_web.connect(p_web, ip_web, function () {
  console.log("Contectado al " + ${"serv_web") + ip_web + " en puerto " + p_web;
});

/*
.............................................................
... conexion a servidor publicaciones
.............................................................
*/

var ip_publicaciones = require("../cfg.json").manual.monitor.ip_publicaciones;
var p_publicaciones = require("../cfg.json").manual.monitor.port_publicaciones;

var serv_publicaciones = new net.Socket();
serv_publicaciones.connect(p_publicaciones, ip_publicaciones, function () {
  console.log("Contectado al " + ${"serv_publicaciones") + ip_publicaciones + " en puerto " + p_publicaciones;
});

/*
.............................................................
... conexion a servidor pagos
.............................................................
*/

var ip_pagos = require("../cfg.json").manual.monitor.ip_pagos;
var p_pagos = require("../cfg.json").manual.monitor.port_pagos;

var serv_pagos = new net.Socket();
serv_pagos.connect(p_pagos, ip_pagos, function () {
  console.log("Contectado al " + ${"serv_pagos") + ip_pagos + " en puerto " + p_pagos;
});

/*
.............................................................
... conexion a servidor infracciones
.............................................................
*/

var ip_infracciones = require("../cfg.json").manual.monitor.ip_infracciones;
var p_infracciones = require("../cfg.json").manual.monitor.port_infracciones;

var serv_infracciones = new net.Socket();
serv_infracciones.connect(p_infracciones, ip_infracciones, function () {
  console.log("Contectado al " + ${"serv_infracciones") + ip_infracciones + " en puerto " + p_infracciones;
});

/*
.............................................................
... conexion a servidor envios
.............................................................
*/

var ip_envios = require("../cfg.json").manual.monitor.ip_envios;
var p_envios = require("../cfg.json").manual.monitor.port_envios;

var serv_envios = new net.Socket();
serv_envios.connect(p_envios, ip_envios, function () {
  console.log("Contectado al " + ${"serv_envios") + ip_envios + " en puerto " + p_envios;
});

/*
.............................................................
... conexion a servidor compras
.............................................................
*/

var ip_compras = require("../cfg.json").manual.monitor.ip_compras;
var p_compras = require("../cfg.json").manual.monitor.port_compras;

var serv_compras = new net.Socket();
serv_compras.connect(p_compras, ip_compras, function () {
  console.log("Contectado al " + ${"serv_compras") + ip_compras + " en puerto " + p_compras;
});
