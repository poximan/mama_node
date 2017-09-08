module.exports = Publicacion;

function Publicacion(descripcion, precio, cantidad, vendedor, infracciones) {
    this.descripcion = descripcion;
    this.precio = precio;
    this.cantidad = cantidad;
    this.vendedor = vendedor;
    this.infracciones = infracciones;
}

Publicacion.prototype.toString = function nuevoToString() {
    return this.descripcion + " cant. " + this.vendedor + "\n";
}
