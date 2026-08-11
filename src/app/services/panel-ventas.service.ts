import { Injectable } from '@angular/core';
import { Articulo } from '../models/articulo';

@Injectable({
  providedIn: 'root'
})
export class PanelVentasService {

  // Lista completa de productos cargada del backend
  public productos: Articulo[] = [];

  // Resultados filtrados que muestra la tabla de búsqueda
  public resultadosBusqueda: Articulo[] = [];

  // Controlan si se muestran los datalist de autocompletado
  public mostrarListaNombres: boolean = false;
  public mostrarListaCategorias: boolean = false;

  constructor() {}

  // Guarda la lista completa de productos en el servicio
  setProductos(articulos: Articulo[]) {
    this.productos = articulos;
  }

  // Devuelve los nombres únicos de todos los productos
  obtenerProductosUnicos(): string[] {
    return this.productos.length > 0
      ? Array.from(new Set(this.productos.map(producto => producto.nombre)))
      : [];
  }

  // Devuelve las categorías únicas de todos los productos
  obtenerCategoriasUnicas(): string[] {
    return this.productos.length > 0
      ? Array.from(new Set(this.productos.map(producto => producto.categoria)))
      : [];
  }

  // Muestra el datalist de nombres solo si hay al menos 2 caracteres escritos
  actualizarListaNombres(nombre: string) {
    this.mostrarListaNombres = nombre.length >= 2;
  }

  // Muestra el datalist de categorías solo si hay al menos 2 caracteres escritos
  actualizarListaCategorias(categoria: string) {
    this.mostrarListaCategorias = categoria.length >= 2;
  }

  // Filtra los productos por nombre y/o categoría y guarda el resultado
  buscarProductos(nombre: string, categoria: string) {
    this.resultadosBusqueda = this.productos.filter(producto =>
      (nombre.trim()    === '' || producto.nombre.toLowerCase().includes(nombre.toLowerCase()))    &&
      (categoria.trim() === '' || producto.categoria.toLowerCase().includes(categoria.toLowerCase()))
    );
  }

  // Vacía los resultados de búsqueda
  limpiarBusqueda() {
    this.resultadosBusqueda = [];
  }
}
