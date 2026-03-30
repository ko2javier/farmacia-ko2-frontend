import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Articulo } from '../models/articulo';
import { CarritoItem } from '../models/CarritoItem';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: CarritoItem[] = [];
  private carritoSubject = new BehaviorSubject<CarritoItem[]>([]);

  constructor() {}

  /**
   * 📌 Inicializa el carrito con todos los productos de la búsqueda, estableciendo cantidadCompra = 0
   */

 inicializarCarrito(productos: Articulo[]) {
   productos.forEach((producto) => {
     const productoExistente = this.carrito.find(item => item.articulo.id === producto.id);
     if (!productoExistente) {
       this.carrito.push({ articulo: producto, cantidadCompra: 0 });
     }
   });
   this.carritoSubject.next(this.carrito);
 }

 /**
   * 📌 Vaciar carrito
   */
vaciarCarrito(){
  this.carrito=[];
}

  /**
   * 📌 Obtiene el carrito como un observable para actualizaciones en tiempo real
   */
  obtenerCarrito() {
    return this.carritoSubject.asObservable();
  }

  /**
   * 📌 Verifica si un producto ya está en el carrito con cantidad > 0 (para cambiar el botón a "Añadido")
   */
  estaEnCarrito(productoId: number): boolean {
    return this.carrito.some(item => item.articulo.id === productoId && item.cantidadCompra > 0);
  }

  /**
   * 📌 Añade un producto al carrito o incrementa su cantidad si ya está
   */
  agregarAlCarrito(productoId: number) {
    const productoExistente = this.carrito.find(item => item.articulo.id === productoId);
    if (productoExistente && productoExistente.articulo.cantidad > 0) {
      productoExistente.cantidadCompra += 1;
    } else {
      return;
    }
    this.carritoSubject.next(this.carrito);
  }

  /**
   * 📌 Reduce la cantidad de un producto en el carrito
   */
  reducirCantidad(productoId: number) {
    const producto = this.carrito.find(item => item.articulo.id === productoId);

    if (producto && producto.cantidadCompra > 0) {
      producto.cantidadCompra -= 1;
      this.carritoSubject.next(this.carrito);
    }
  }
  //📌 Aumenta la cantidad de un producto en el carrito
  aumentarCantidad(productoId: number) {
    const producto = this.carrito.find(item => item.articulo.id === productoId);
    
    if (producto && producto.cantidadCompra < producto.articulo.cantidad) {
      producto.cantidadCompra += 1;
      this.carritoSubject.next(this.carrito);
    }
  }
  
  

  /**
   * 📌 Filtra y obtiene solo los productos con `cantidadCompra > 0`
   */
  obtenerProductosSeleccionados(): CarritoItem[] {
    return this.carrito.filter(item => item.cantidadCompra > 0);
  }

  /**
   * 📌 Obtiene la cantidad total de productos en el carrito
   */
  obtenerCantidadTotal(): number {
    return this.carrito.reduce((total, item) => total + item.cantidadCompra, 0);
  }
}
