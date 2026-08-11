import { Component, OnInit } from '@angular/core';
import { ActivityLog } from '../../models/activity-log.model';
import { ActivityLogService } from '../../services/activity-log.service';

@Component({
  selector: 'app-activity-log',
  standalone: false,
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.css'
})
export class ActivityLogComponent implements OnInit {

  // Lista completa que llega del backend
  registros: ActivityLog[] = [];
  // Lista filtrada según el buscador
  registrosFiltrados: ActivityLog[] = [];
  // Porción que se muestra en la tabla (10 por página)
  registrosPaginados: ActivityLog[] = [];

  // Campos del buscador
  textoBusqueda: string = '';
  fechaBusqueda: string = '';

  // Control de paginación
  paginaActual: number = 1;
  rowsPerPage: number = 10;
  totalPaginas: number = 0;

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.activityLogService.getAll().subscribe({
      next: (registros) => {
        this.registros = registros;
        this.aplicarFiltros();
      }
    });
  }

  // Filtra los registros por texto y/o fecha
  aplicarFiltros(): void {
    const texto = this.textoBusqueda.toLowerCase();
    this.registrosFiltrados = this.registros.filter(registro => {
      const coincideTexto = !texto ||
        registro.username.toLowerCase().includes(texto) ||
        registro.action.toLowerCase().includes(texto)   ||
        registro.detail.toLowerCase().includes(texto);
      const coincideFecha = !this.fechaBusqueda || registro.fecha === this.fechaBusqueda;
      return coincideTexto && coincideFecha;
    });
    this.totalPaginas = Math.max(1, Math.ceil(this.registrosFiltrados.length / this.rowsPerPage));
    this.paginaActual = 1;
    this.mostrarPagina();
  }

  // Borra los filtros y muestra todos los registros
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.fechaBusqueda = '';
    this.aplicarFiltros();
  }

  // Cambia de página si el número es válido
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.mostrarPagina();
    }
  }

  // Recorta la lista para mostrar solo los registros de la página actual
  private mostrarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.rowsPerPage;
    this.registrosPaginados = this.registrosFiltrados.slice(inicio, inicio + this.rowsPerPage);
  }

  // Devuelve la clase CSS del badge según el tipo de acción registrada
  badgeClass(action: string): string {
    switch (action) {
      case 'LOGIN_SUCCESS':
      case 'INSERT_PRODUCT':
      case 'INSERT_USER':
        return 'bg-success';
      case 'LOGIN_FAILED':
      case 'DELETE_PRODUCT':
      case 'DELETE_USER':
        return 'bg-danger';
      case 'CANCEL_SALE':
        return 'bg-warning text-dark';
      case 'FORBIDDEN_ACTION':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  }
}
