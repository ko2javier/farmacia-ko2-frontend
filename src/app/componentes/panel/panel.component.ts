import { Component, OnInit } from '@angular/core';
import { ArticuloService } from '../../services/articulo.service';
import { PanelVentasService } from '../../services/panel-ventas.service';
import { Articulo } from '../../models/articulo';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent implements OnInit {
  searchNombre: string = '';
  searchCategoria: string = '';
  flag_search: boolean = false;
  resultadosBusqueda: Articulo[] = []; // Almacena los productos filtrados
  mostrarResultados: boolean = false; // ✅ Nuevo estado para activar los resultados

  constructor(
    private articuloService: ArticuloService,
    public panelVentasService: PanelVentasService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.articuloService.cargarArticulos().subscribe(
      (data) => {
        this.panelVentasService.setProductos(data);
      },
      (error) => console.error("❌ Error al obtener productos:", error)
    );
  }

  buscarProductos() {
    this.flag_search = true;
    this.mostrarResultados = true; // ✅ Activa la vista de resultados
    this.panelVentasService.buscarProductos(this.searchNombre, this.searchCategoria);
  }

  clear() {
    this.searchNombre = '';
    this.searchCategoria = '';
    this.flag_search = false;
    this.mostrarResultados = false;  // ✅ Oculta la tabla de resultados

     // 🔹 Restablecer la visibilidad de los datalist
     this.panelVentasService.mostrarListaNombres = false;
     this.panelVentasService.mostrarListaCategorias = false;
    this.panelVentasService.limpiarBusqueda();
}



  seleccionarProducto() {
    const productoEncontrado = this.resultadosBusqueda.find(prod => prod.nombre === this.searchNombre);
    if (productoEncontrado) {
      this.searchCategoria = productoEncontrado.categoria;
    }
  }

  get productosUnicos(): string[] {
    return this.panelVentasService.obtenerProductosUnicos();
  }

  get categoriasUnicas(): string[] {
    return this.panelVentasService.obtenerCategoriasUnicas();
  }
}
