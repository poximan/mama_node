class Config {

  constructor(strategy) {
    this.data;
    this.strategy = strategy;
  }

  altaSuscriptor(cola_escucha) {
    console.log("INT: suscribiendo a cola", cola_escucha);
    this.strategy.altaSuscriptor(cola_escucha);
  }

  altaPublicador(){
    this.data = this.strategy.altaPublicador();
  }

  publicar(suscriptores, msg){    
    this.strategy.publicar(this.data, suscriptores, msg);
  }
}
module.exports = Config;
