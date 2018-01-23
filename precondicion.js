var ps = require('ps-node');

/*
este modulo controla que las precondiciones en terminos de procesos activos esten presentes
se verifica que este ejecutandose el proceso mongod, encargado de persistir los datos
*/
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
