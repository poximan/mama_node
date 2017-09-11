var port_web = require("../cfg.json").monitor.port_web;

var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io');

var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
    res.end(fs.readFileSync(__dirname + '/manWeb.html'));

}).listen(port_web, function() {
    console.log('...');
});

socketio.listen(server).on('connection', function (socket) {

  socket.on('message', function (msg) {

    if(msg === "nuevaCompra")
      console.log("lanzar");
    else
      console.log(msg);
  });
});
