import { Component, OnInit } from '@angular/core';
import { VentasCanceladasService } from '../../services/ventas-canceladas.service';

@Component({
  selector: 'app-ventas-canceladas',
  standalone: false,
  templateUrl: './ventas-canceladas.component.html',
  styleUrls: ['./ventas-canceladas.component.css']
})
export class VentasCanceladasComponent implements OnInit {

  cancelaciones: any[] = [];

  // Variables del paginado
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedCancelaciones: any[] = [];

  constructor(private ventasCanceladasService: VentasCanceladasService) { }

  ngOnInit(): void {
    this.cargarDatosReales();
  }

  cargarDatosReales(): void {
    this.ventasCanceladasService.getCancelaciones().subscribe(
      (data) => {
        console.log("✅ Datos recibidos de la DB:", data);

        // Asignamos los datos reales
        this.cancelaciones = data;

        // Recalculamos paginación
        this.totalPages = Math.ceil(this.cancelaciones.length / this.rowsPerPage);

        // 🟢 ÚNICO CAMBIO: Evitar bug visual "Página 1 de 0" si no hay datos
        if (this.totalPages === 0) this.totalPages = 1;

        this.displayTable(1);
      },
      (error) => {
        console.error("❌ Error al obtener cancelaciones:", error);
      }
    );
  }

  /** Metodos de Paginación */
  displayTable(page: number): void {
    // Quitamos el 'return' si está vacío para asegurarnos que limpie la tabla visualmente
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedCancelaciones = this.cancelaciones.slice(start, end);
  }

  changePage(page: number): void {
    // Tu lógica original funciona perfecta con los botones Anterior/Siguiente
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayTable(page);
    }
  }
}
