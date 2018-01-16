var shell_ejec = require('./shell_con_cb')
var async = require('async');

var modo_operacion = process.argv.slice(2)[0];

if (modo_operacion.length == 0 ||
  (modo_operacion != "man" && modo_operacion != "auto")) {
  console.log("Usar: levantar_serv.js {man|auto}");
  process.exit(1);
}

var operaciones = [
  function(callback) {

    console.log("levantando servidores");
    shell_ejec.execCommand("start ventana /K \"cd compras && node \"" + modo_operacion + "\"Compras.js\"", function (returnvalue) {
    });
    shell_ejec.execCommand("start ventana /K \"cd envios && node \"" + modo_operacion + "\"Envios.js\"", function (returnvalue) {
    });
    shell_ejec.execCommand("start ventana /K \"cd infracciones && node \"" + modo_operacion + "\"Infracciones.js\"", function (returnvalue) {
    });
    shell_ejec.execCommand("start ventana /K \"cd pagos && node \"" + modo_operacion + "\"Pagos.js\"", function (returnvalue) {
    });
    shell_ejec.execCommand("start ventana /K \"cd publicaciones && node \"" + modo_operacion + "\"Publicaciones.js\"", function (returnvalue) {
    });
    shell_ejec.execCommand("start ventana /K \"cd web && node \"" + modo_operacion + "\"Web.js\"", function (returnvalue) {
    });

    callback(null);
  },

  function(callback) {

    console.log("levantando monitor");
    shell_ejec.execCommand("start ventana /K \"cd monitor && node monitor.js\"", function (returnvalue) {
    });

    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("todos los servidores activos");
});
