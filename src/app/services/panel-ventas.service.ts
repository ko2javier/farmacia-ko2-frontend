import { Injectable } from '@angular/core';
import { Articulo } from '../models/articulo';

@Injectable({
  providedIn: 'root'
})
export class PanelVentasService {
  public productos: Articulo[] = [];
  public resultadosBusqueda: Articulo[] = []; // ✅ Guarda los resultados filtrados
  public mostrarListaNombres: boolean = false;
  public mostrarListaCategorias: boolean = false;

  constructor() {}

  setProductos(data: Articulo[]) {
    this.productos = data;
  }

  obtenerProductosUnicos(): string[] {
    return this.productos.length > 0
      ? Array.from(new Set(this.productos.map((producto) => producto.nombre)))
      : [];
  }

  obtenerCategoriasUnicas(): string[] {
    return this.productos.length > 0
      ? Array.from(new Set(this.productos.map((producto) => producto.categoria)))
      : [];
  }

  actualizarListaNombres(searchNombre: string) {
    this.mostrarListaNombres = searchNombre.length >= 2;
  }

  actualizarListaCategorias(searchCategoria: string) {
    this.mostrarListaCategorias = searchCategoria.length >= 2;
  }

  buscarProductos(searchNombre: string, searchCategoria: string) {
    console.log("🔍 Buscando productos con:", searchNombre, searchCategoria);

    this.resultadosBusqueda = this.productos.filter(producto =>
      (searchNombre.trim() === '' || producto.nombre.toLowerCase().includes(searchNombre.toLowerCase())) &&
      (searchCategoria.trim() === '' || producto.categoria.toLowerCase().includes(searchCategoria.toLowerCase()))
    );
  }

  limpiarBusqueda() {
    console.log("🧹 Limpiando búsqueda...");
    this.resultadosBusqueda = [];
  }
}
