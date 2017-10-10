var shell_ejec = require('./shell')
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

    // servidor base de datos (hay que crear carpeta C:\data\db)
    shell_ejec("start ventana /K \"c:\ && cd Program Files && cd MongoDB && cd Server && cd 3.0 && cd bin && mongod.exe\"");

    // servidores negocio
    shell_ejec("start ventana /K \"cd compras && node \"" + modo_operacion + "\"Compras.js\"");
    shell_ejec("start ventana /K \"cd envios && node \"" + modo_operacion + "\"Envios.js\"");
    shell_ejec("start ventana /K \"cd infracciones && node \"" + modo_operacion + "\"Infracciones.js\"");
    shell_ejec("start ventana /K \"cd pagos && node \"" + modo_operacion + "\"Pagos.js\"")
    shell_ejec("start ventana /K \"cd publicaciones && node \"" + modo_operacion + "\"Publicaciones.js\"");
    shell_ejec("start ventana /K \"cd web && node \"" + modo_operacion + "\"Web.js\"");

    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("todos los servidores activos");
});
