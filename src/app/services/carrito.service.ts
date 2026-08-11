import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Articulo } from '../models/articulo';
import { CarritoItem } from '../models/CarritoItem';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  // Lista interna del carrito — cada entrada tiene el artículo y la cantidad seleccionada
  private carrito: CarritoItem[] = [];

  // BehaviorSubject que emite el carrito cada vez que cambia, para que los componentes reaccionen
  private carritoSubject = new BehaviorSubject<CarritoItem[]>([]);

  constructor() {}

  // Carga los productos de una búsqueda en el carrito con cantidad 0
  // Si el producto ya estaba en el carrito, no lo duplica
  inicializarCarrito(productos: Articulo[]) {
    productos.forEach((producto) => {
      const yaExiste = this.carrito.find(carritoItem => carritoItem.articulo.id === producto.id);
      if (!yaExiste) {
        this.carrito.push({ articulo: producto, cantidadCompra: 0 });
      }
    });
    this.carritoSubject.next(this.carrito);
  }

  // Vacía el carrito completamente
  vaciarCarrito() {
    this.carrito = [];
    this.carritoSubject.next(this.carrito);
  }

  // Devuelve el carrito como Observable para que los componentes se suscriban a sus cambios
  obtenerCarrito() {
    return this.carritoSubject.asObservable();
  }

  // Devuelve true si un producto ya está en el carrito con al menos 1 unidad
  estaEnCarrito(productoId: number): boolean {
    return this.carrito.some(
      carritoItem => carritoItem.articulo.id === productoId && carritoItem.cantidadCompra > 0
    );
  }

  // Añade una unidad al carrito. Solo funciona si hay stock disponible
  agregarAlCarrito(productoId: number) {
    const producto = this.carrito.find(carritoItem => carritoItem.articulo.id === productoId);
    if (producto && producto.articulo.cantidad > 0) {
      producto.cantidadCompra += 1;
      this.carritoSubject.next(this.carrito);
    }
  }

  // Aumenta la cantidad de un producto. No puede superar el stock disponible
  aumentarCantidad(productoId: number) {
    const producto = this.carrito.find(carritoItem => carritoItem.articulo.id === productoId);
    if (producto && producto.cantidadCompra < producto.articulo.cantidad) {
      producto.cantidadCompra += 1;
      this.carritoSubject.next(this.carrito);
    }
  }

  // Reduce en 1 la cantidad de un producto. Si llega a 0, queda en el carrito pero sin marcar
  reducirCantidad(productoId: number) {
    const producto = this.carrito.find(carritoItem => carritoItem.articulo.id === productoId);
    if (producto && producto.cantidadCompra > 0) {
      producto.cantidadCompra -= 1;
      this.carritoSubject.next(this.carrito);
    }
  }

  // Devuelve solo los productos con cantidad mayor a 0 (los que se van a comprar)
  obtenerProductosSeleccionados(): CarritoItem[] {
    return this.carrito.filter(carritoItem => carritoItem.cantidadCompra > 0);
  }

  // Devuelve el número total de unidades en el carrito (suma de todas las cantidades)
  obtenerCantidadTotal(): number {
    return this.carrito.reduce((total, carritoItem) => total + carritoItem.cantidadCompra, 0);
  }
}
