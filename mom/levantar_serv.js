var shell_ejec = require('../shell')
var async = require('async');

var operaciones = [
  function(callback) {
    callback(null);
  },
  function(callback) {

    console.log("levantando servidor compras");
    shell_ejec("start cmd.exe /K \"cd.. && cd compras && node autoCompras.js\"");

    console.log("levantando servidor infracciones")
    shell_ejec("start cmd.exe /K \"cd.. && cd infracciones && node autoInfracciones.js\"");

    console.log("levantando servidor web");
    shell_ejec("start cmd.exe /K \"cd.. && cd web && node autoWeb.js\"");

    console.log("levantando servidor publicaciones");
    shell_ejec("start cmd.exe /K \"cd.. && cd publicaciones && node autoPublicaciones.js\"");

    console.log("levantando servidor envios");
    shell_ejec("start cmd.exe /K \"cd.. && cd envios && node autoEnvios.js\"");

    //shell_ejec("start cmd.exe /K \"cd.. && cd pagos && node autoPagos.js\"")

    console.log("todos los servidores activos");
    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("servidores activos");
});
