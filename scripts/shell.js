#!/usr/bin/env node

const { exec } = require('child_process');

function ejecutar(cmd){
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(`salida error: ${stderr}`);
  });
}

module.exports = ejecutar;
