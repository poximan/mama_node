var ps = require('ps-node');

// A simple pid lookup
ps.lookup({command: 'mongod', psargs: '-l'}, function(err, resultList ) {

  if (err) throw new Error(err);

  var falta_proceso = true;

  resultList.forEach(function(process){
    if(process.command === "mongod.exe")
      falta_proceso = false;
  });

  if(falta_proceso){
    console.error("\nINT: no se encontro proceso de persitencia mongod activo, cerrando proceso...\n");
    process.exit(1);
  }
});
