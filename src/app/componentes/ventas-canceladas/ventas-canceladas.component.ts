import { Component, OnInit } from '@angular/core';
import { VentasCanceladasService } from '../../services/ventas-canceladas.service'; // ✅ Tu servicio correcto
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ventas-canceladas',
  standalone: false,
  templateUrl: './ventas-canceladas.component.html',
  styleUrls: ['./ventas-canceladas.component.css']
})
export class VentasCanceladasComponent implements OnInit {

  // 🟢 1. Estructura de datos para filtros
  cancelacionesOriginal: any[] = [];   // Copia de seguridad (TODO)
  cancelacionesFiltradas: any[] = [];  // Lista activa (Filtros aplicados)
  paginatedCancelaciones: any[] = [];  // Lo que se ve en pantalla (Paginado)

  // 🟢 2. Variables de los inputs del buscador
  textoBusqueda: string = '';
  fechaBusqueda: string = '';

  // Variables del paginado
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;

  constructor(
    private ventasCanceladasService: VentasCanceladasService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.cargarDatosReales();
  }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  // ✅ Tu método original, pero adaptado para guardar la copia de seguridad
  cargarDatosReales(): void {
    this.ventasCanceladasService.getCancelaciones().subscribe(
      (data) => {
        // Guardamos en Original y en Filtrada (al inicio son iguales)
        this.cancelacionesOriginal = data;
        this.cancelacionesFiltradas = data;

        // Calculamos paginación inicial
        this.calcularPaginacion();
      },
      (error) => {
        // TODO: añadir manejo de error UI
      }
    );
  }

  // 🟢 LÓGICA DE FILTRADO (Texto y Fecha)
  aplicarFiltros(): void {
    let temporal = this.cancelacionesOriginal;

    // 1. Filtro por Texto (Producto o Responsable)
    if (this.textoBusqueda) {
      const texto = this.textoBusqueda.toLowerCase();
      temporal = temporal.filter(item =>
        (item.nombreProducto && item.nombreProducto.toLowerCase().includes(texto)) ||
        (item.responsable && item.responsable.toLowerCase().includes(texto))
      );
    }

    // 2. Filtro por Fecha
    if (this.fechaBusqueda) {
      temporal = temporal.filter(item =>
        item.fecha && item.fecha.toString().startsWith(this.fechaBusqueda)
      );
    }

    // Actualizamos la lista filtrada y volvemos a la página 1
    this.cancelacionesFiltradas = temporal;
    this.currentPage = 1;
    this.calcularPaginacion();
  }

  // 🟢 Limpiar filtros
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.fechaBusqueda = '';
    this.cancelacionesFiltradas = this.cancelacionesOriginal; // Restauramos todo
    this.currentPage = 1;
    this.calcularPaginacion();
  }

  // ✅ Método auxiliar para recalcular páginas y cortar el array
  calcularPaginacion(): void {
    // Usamos 'cancelacionesFiltradas' para calcular el total
    this.totalPages = Math.ceil(this.cancelacionesFiltradas.length / this.rowsPerPage);

    if (this.totalPages === 0) this.totalPages = 1;

    // Mostramos la página actual
    this.displayTable(this.currentPage);
  }

  /** Metodos de Paginación */
  displayTable(page: number): void {
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;

    // IMPORTANTE: Cortamos de 'cancelacionesFiltradas', no de la original
    this.paginatedCancelaciones = this.cancelacionesFiltradas.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayTable(page);
    }
  }
}
