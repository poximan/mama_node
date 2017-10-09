var shell_ejec = require('../shell')
var async = require('async');

var modo_operacion = process.argv.slice(2);

if (modo_operacion.length == 0) {
  console.log("Usar: levantar_serv.js {man|auto}");
  process.exit(1);
}

var operaciones = [
  function(callback) {
    callback(null);
  },
  function(callback) {

    console.log("levantando servidores");

    shell_ejec("start shell /K \"cd compras && node \"" + modo_operacion + "\"Compras.js\"");
    shell_ejec("start shell /K \"cd envios && node \"" + modo_operacion + "\"Envios.js\"");
    shell_ejec("start shell /K \"cd infracciones && node \"" + modo_operacion + "\"Infracciones.js\"");

    //shell_ejec("start shell /K \"cd pagos && node \"" + modo_operacion + "\"Pagos.js\"")
    shell_ejec("start shell /K \"cd pagos && node \"" + "manPagos.js\"");

    //shell_ejec("start shell /K \"cd publicaciones && node \"" + modo_operacion + "\"Publicaciones.js\"");
    shell_ejec("start shell /K \"cd publicaciones && node \"" + "manPublicaciones.js\"");

    //shell_ejec("start shell /K \"cd web && node \"" + modo_operacion + "\"Web.js\"");
    shell_ejec("start shell /K \"cd web && node \"" + "manWeb.js\"");

    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("todos los servidores activos");
});
