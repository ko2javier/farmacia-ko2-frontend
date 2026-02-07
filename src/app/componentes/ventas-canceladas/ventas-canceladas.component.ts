import { Component, OnInit } from '@angular/core';
import { VentasCanceladasService } from '../../services/ventas-canceladas.service'; // 👈 Importante

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

  // 👇 Inyectamos el servicio aquí
  constructor(private ventasCanceladasService: VentasCanceladasService) { }

  ngOnInit(): void {
    this.cargarDatosReales(); // 👇 Llamamos al método nuevo
  }

  cargarDatosReales(): void {
    this.ventasCanceladasService.getCancelaciones().subscribe(
      (data) => {
        console.log("✅ Datos recibidos de la DB:", data);
        
        // Asignamos los datos reales
        this.cancelaciones = data; 
        
        // Recalculamos paginación
        this.totalPages = Math.ceil(this.cancelaciones.length / this.rowsPerPage);
        this.displayTable(1);
      },
      (error) => {
        console.error("❌ Error al obtener cancelaciones:", error);
      }
    );
  }

  /** Metodos de Paginación (Iguales que antes) */
  displayTable(page: number): void {
    if (!this.cancelaciones.length) return; 
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedCancelaciones = this.cancelaciones.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayTable(page);
    }
  }
}