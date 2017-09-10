var shell_ejec = require('../shell')
var async = require('async');

var operaciones = [
  function(callback) {
    callback(null);
  },
  function(callback) {

    console.log("levantando servidores");

    shell_ejec("start shell /K \"cd web && node autoWeb.js\"");
    shell_ejec("start shell /K \"cd compras && node autoCompras.js\"");
    shell_ejec("start shell /K \"cd infracciones && node autoInfracciones.js\"");
    shell_ejec("start shell /K \"cd publicaciones && node autoPublicaciones.js\"");
    shell_ejec("start shell /K \"cd envios && node autoEnvios.js\"");
    shell_ejec("start shell /K \"cd pagos && node autoPagos.js\"")

    console.log("todos los servidores activos");
    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("servidores activos");
});
