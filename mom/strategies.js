module.exports.rabbit = {

  altaSuscriptor: cola_escucha => require("./momSuscriptorAdapter")(cola_escucha),
  altaPublicador: function(){
    return require("./momPublicadorAdapter")
  },
  publicar: function(publicador, suscriptores, msg) {
    publicador().publicar(suscriptores, msg);
  }
}

module.exports.otroBroker = {
}
