module.exports = function(){

  var module = {};

  module.esperar = function(tiempo){
    sleep(tiempo, function() {
    });
  }

  function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
  }

  return module;
}
