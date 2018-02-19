var shell_ejec = require('./shell_con_cb')
var async = require('async');

var modo_operacion = process.argv.slice(2)[0];

if (modo_operacion.length == 0 ||
  (modo_operacion != "man" && modo_operacion != "auto")) {
  console.log("Usar: levantar_serv.js {man|auto}");
  process.exit(1);
}

async.series([
  function(callback) {
    shell_ejec.execCommand("start ventana /K \"cd.. && cd compras && node \"" +
                            modo_operacion +
                            "\"Compras.js\"", function (returnvalue) {
                            })
                            callback(null, "servidor compras activo");
  },
  function(callback) {
    shell_ejec.execCommand("start ventana /K \"cd.. && cd envios && node \"" +
                            modo_operacion +
                            "\"Envios.js\"", function (returnvalue) {
                            })
                            callback(null, "servidor envios activo");
  },
  function(callback) {
    shell_ejec.execCommand("start ventana /K \"cd.. && cd infracciones && node \"" +
                            modo_operacion +
                            "\"Infracciones.js\"", function (returnvalue) {
                            })
                            callback(null, "servidor infracciones activo");
  },
  function(callback) {
    shell_ejec.execCommand("start ventana /K \"cd.. && cd pagos && node \"" +
                            modo_operacion +
                            "\"Pagos.js\"", function (returnvalue) {
                            })
                            callback(null, "servidor pagos activo");
  },
  function(callback) {
    shell_ejec.execCommand("start ventana /K \"cd.. && cd publicaciones && node \"" +
                            modo_operacion +
                            "\"Publicaciones.js\"", function (returnvalue) {
                            })
                            callback(null, "servidor publicaciones activo");
  },
  function(callback) {
    shell_ejec.execCommand("start ventana /K \"cd.. && cd web && node \"" +
                            modo_operacion +
                            "\"Web.js\"", function (returnvalue) {
                            })
                            callback(null, "servidor web activo");
  },
  function(callback) {
    shell_ejec.execCommand("start ventana /K \"cd.. && cd monitor && node monitor.js\"", function (returnvalue) {
    });
    callback(null, "monitor activo");
  }
],
// optional callback
function(err, results) {
  console.log(results);
});
