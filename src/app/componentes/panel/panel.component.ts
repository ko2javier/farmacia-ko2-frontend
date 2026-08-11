import { Component, OnInit } from '@angular/core';
import { ArticuloService } from '../../services/articulo.service';
import { PanelVentasService } from '../../services/panel-ventas.service';
import { Articulo } from '../../models/articulo';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {

  // Lista completa de productos cargada una sola vez al iniciar
  articulosOriginal: Articulo[] = [];

  // Campos del formulario de búsqueda
  busquedaNombre: string = '';
  busquedaCategoria: string = '';

  // Controla si se ha lanzado una búsqueda y si se muestra la tabla de resultados
  busquedaActiva: boolean = false;
  mostrarResultados: boolean = false;

  constructor(
    private articuloService: ArticuloService,
    public panelVentasService: PanelVentasService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  // Pide todos los artículos al backend y los guarda en memoria para filtrar localmente
  cargarProductos() {
    this.articuloService.cargarArticulos().subscribe(
      (articulos) => {
        this.articulosOriginal = articulos;
        this.panelVentasService.setProductos(articulos);
      },
      (error) => {}
    );
  }

  // Filtra la lista local por nombre y/o categoría sin volver a llamar al backend
  buscarProductos() {
    this.busquedaActiva    = true;
    this.mostrarResultados = true;

    let resultados = this.articulosOriginal;

    if (this.busquedaNombre && this.busquedaNombre.trim() !== '') {
      const texto = this.busquedaNombre.toLowerCase();
      resultados = resultados.filter(articulo =>
        articulo.nombre.toLowerCase().includes(texto)
      );
    }

    if (this.busquedaCategoria && this.busquedaCategoria.trim() !== '') {
      const categoria = this.busquedaCategoria.toLowerCase();
      resultados = resultados.filter(articulo =>
        articulo.categoria.toLowerCase().includes(categoria)
      );
    }

    // Pasamos los resultados al servicio para que los pinte la tabla
    this.panelVentasService.resultadosBusqueda = resultados;
  }

  // Limpia el formulario y oculta los resultados
  limpiarBusqueda() {
    this.busquedaNombre    = '';
    this.busquedaCategoria = '';
    this.busquedaActiva    = false;
    this.mostrarResultados = false;
    this.panelVentasService.limpiarBusqueda();
  }

  // Si el usuario escribe el nombre exacto de un producto, rellena automáticamente la categoría
  seleccionarProducto() {
    const productoEncontrado = this.articulosOriginal.find(
      articulo => articulo.nombre.toLowerCase() === this.busquedaNombre.toLowerCase()
    );
    if (productoEncontrado) {
      this.busquedaCategoria = productoEncontrado.categoria;
    }
  }

  // Getter: nombres únicos para el datalist — filtra por lo que ya está escrito
  get productosUnicos(): string[] {
    if (this.busquedaNombre) {
      const texto = this.busquedaNombre.toLowerCase();
      return [...new Set(this.articulosOriginal
        .filter(articulo => articulo.nombre.toLowerCase().includes(texto))
        .map(articulo => articulo.nombre))];
    }
    return [...new Set(this.articulosOriginal.map(articulo => articulo.nombre))].slice(0, 50);
  }

  // Getter: categorías únicas para el datalist
  get categoriasUnicas(): string[] {
    return [...new Set(this.articulosOriginal.map(articulo => articulo.categoria))];
  }
}
