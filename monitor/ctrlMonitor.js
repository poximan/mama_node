var servidores = require("./servNegocio");
var server = net.createServer();
var _ = require('underscore');
var p_monitor = require("../cfg.json").manual.monitor.port_monitor;

/*
.............................................................
... conexion a cliente web
.............................................................
*/

var conexiones = servidores.conexiones;

server.listen(p_monitor, function () {
  console.log('Servidor de monitoreo escuchando en el puerto %j', server.address());
});

server.on('connection', function (sock) {
  console.log('Nueva Conexión');
  console.log('socket remoto: ' + sock.remoteAddress + ' ' + sock.remotePort);
  console.log('socket local: ' + sock.localAddress + ' ' + sock.localPort);

  sock.setEncoding('utf8');

  sock.on('data',function (data) {
    console.log('distributed monitor --> ',data);
    var cliente = null;
    var commandLine = data.trim().split(" ");
    switch (commandLine[0]) {

      case 'compras':
        cliente = compras;
        break;
      case 'infracciones':
        cliente = infracciones;
        break;
      case 'web':
        cliente = web;
        break;

      case 'estado':
        for (cli of conexiones) {
          cli.write('estado');
        }
        break;

      default:
        sock.write('Servidor o comando' + commandLine[0] + ' desconocido\n');
    }

    if (cliente) {
      cliente.write(commandLine[1] + ' ' + commandLine[2]);
      cliente.write('getAllCompras');
    }

  });

  sock.on('end',function () {
    console.log('Fin del socket: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });

  sock.once('close',function (data) {
    console.log('Socket Cerrado: ' + sock.remoteAddress +' '+ sock.remotePort);
  });

  compras.on('data',function (data) {
    sock.write('COMPRAS: ' + data + '\n');
  });

  compras.on('close',function () {
    console.log('conexxion con compras perdida...');
    sock.write('conexxion con compras perdida...');
  });

  infracciones.on('data',function (data) {
    sock.write('INFRACCIONES' + data + '\n');
  });

  infracciones.on('close',function () {
    console.log('conexión con infracciones perdida...');
    sock.write('conexión con infracciones perdida...');
  });

  web.on('data',function (data) {
    sock.write('WEB: ' + data + '\n');
  });

  web.on('close',function () {
    console.log('conexión con web perdida...');
    sock.write('conexión con web perdida...');
  });

});
