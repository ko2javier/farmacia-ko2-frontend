import { Component, OnInit } from '@angular/core';
import { VentasCanceladasService } from '../../services/ventas-canceladas.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ventas-canceladas',
  standalone: false,
  templateUrl: './ventas-canceladas.component.html',
  styleUrls: ['./ventas-canceladas.component.css']
})
export class VentasCanceladasComponent implements OnInit {

  // Lista completa que llega del backend (nunca se modifica)
  cancelacionesOriginal: any[] = [];
  // Lista que se filtra según el buscador
  cancelacionesFiltradas: any[] = [];
  // Porción de cancelacionesFiltradas que se muestra en la tabla (8 por página)
  cancelacionesPaginadas: any[] = [];

  // Campos del buscador
  textoBusqueda: string = '';
  fechaBusqueda: string = '';

  // Control de paginación
  rowsPerPage: number = 8;
  paginaActual: number = 1;
  totalPaginas: number = 0;

  constructor(
    private ventasCanceladasService: VentasCanceladasService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cargarDatosReales();
  }

  // Pide todas las cancelaciones al backend y las muestra en la tabla
  cargarDatosReales(): void {
    this.ventasCanceladasService.getCancelaciones().subscribe(
      (cancelaciones) => {
        this.cancelacionesOriginal  = cancelaciones;
        this.cancelacionesFiltradas = cancelaciones;
        this.calcularPaginacion();
      },
      (error) => {}
    );
  }

  // Filtra la lista según el texto escrito y/o la fecha seleccionada
  aplicarFiltros(): void {
    let resultado = this.cancelacionesOriginal;

    if (this.textoBusqueda) {
      const texto = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(cancelacion =>
        (cancelacion.nombreProducto && cancelacion.nombreProducto.toLowerCase().includes(texto)) ||
        (cancelacion.responsable    && cancelacion.responsable.toLowerCase().includes(texto))
      );
    }

    if (this.fechaBusqueda) {
      resultado = resultado.filter(cancelacion =>
        cancelacion.fecha && cancelacion.fecha.toString().startsWith(this.fechaBusqueda)
      );
    }

    this.cancelacionesFiltradas = resultado;
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  // Borra los filtros y vuelve a mostrar todas las cancelaciones
  limpiarFiltros(): void {
    this.textoBusqueda          = '';
    this.fechaBusqueda          = '';
    this.cancelacionesFiltradas = this.cancelacionesOriginal;
    this.paginaActual           = 1;
    this.calcularPaginacion();
  }

  // Calcula el total de páginas y carga la página actual
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.cancelacionesFiltradas.length / this.rowsPerPage);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
    this.mostrarPagina(this.paginaActual);
  }

  // Recorta la lista filtrada para mostrar solo los registros de la página actual
  mostrarPagina(pagina: number): void {
    const inicio = (pagina - 1) * this.rowsPerPage;
    const fin    = inicio + this.rowsPerPage;
    this.cancelacionesPaginadas = this.cancelacionesFiltradas.slice(inicio, fin);
  }

  // Cambia de página si el número es válido
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.mostrarPagina(pagina);
    }
  }
}
