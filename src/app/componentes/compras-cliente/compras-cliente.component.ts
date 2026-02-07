import { Component, OnInit } from '@angular/core';
import { ComprasCliente } from '../../models/ComprasCliente';
import { ComprasClienteService } from '../../services/compras-cliente-service.service';

@Component({
  selector: 'app-compras-cliente',
  standalone: false,
  templateUrl: './compras-cliente.component.html',
  styleUrl: './compras-cliente.component.css'
})
export class ComprasClienteComponent implements OnInit {
  compras: ComprasCliente[] = [];
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedCompras: ComprasCliente[] = [];

  constructor(private comprasService: ComprasClienteService) {}

  ngOnInit(): void {
    this.obtenerCompras();
  }

  obtenerCompras(): void {
    this.comprasService.obtenerTodasLasCompras().subscribe(
      (data) => {
        this.compras = data;
        console.log("✅ Compras obtenidas:", this.compras);

        this.totalPages = Math.ceil(this.compras.length / this.rowsPerPage);
        this.displayTable(1);
      },
      (error) => {
        console.error('❌ Error al obtener compras:', error);
      }
    );
  }

  displayTable(page: number): void {
    console.log("Cambiando a página:", page);
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedCompras = this.compras.slice(start, end);
    console.log("Datos paginados:", this.paginatedCompras);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayTable(page);
    }
  }
}
