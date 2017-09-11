var net = require('net');

var ip_monitor = require("../cfg.json").monitor.ip_monitor;
var port_monitor = require("../cfg.json").monitor.port_monitor;

var client = new net.Socket();

client.connect(port_monitor, ip_monitor, function() {
  console.log('Connected');
	client.write("comprar");
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});
/*
client.on('error', function() {
	console.log('Connection error');
});
*/
