import { Component, EventEmitter, Output } from '@angular/core';
import { CimaService } from '../../services/cima.service';
import Swal from 'sweetalert2';
import {CimaBackendService} from '../../services/cima-backend.service';

@Component({
  selector: 'app-catalogo-externo',
  standalone: false,
  templateUrl: './catalogo-externo.component.html',
  styleUrls: ['./catalogo-externo.component.css']
})
export class CatalogoExternoComponent {

  terminoBusqueda: string = '';
  resultados: any[] = []; // Aquí guardaremos los 25 productos
  cargando: boolean = false;

  // --- CONFIGURACIÓN PAGINACIÓN LOCAL ---
  paginaActual: number = 1;
  itemsPorPagina: number = 8;

  @Output() importar = new EventEmitter<any>();
  @Output() volver = new EventEmitter<void>();

  constructor(private cimaService: CimaService, private cima_Service: CimaBackendService) {}

  // Busca y trae los 25 resultados de golpe
  buscar() {
    if (this.terminoBusqueda.trim().length < 3) return;

    this.cargando = true;
    this.paginaActual = 1; // Reseteamos a la primera página visual
    this.resultados = [];

    // Pedimos siempre la página 1 a la API (trae 25 items por defecto)
    /*
    this.cimaService.buscarMedicamentos(this.terminoBusqueda, 1).subscribe({
      next: (data) => {
        // Guardamos todo el array (aprox 25 items)
        this.resultados = data.resultados || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo conectar con AEMPS', 'error');
      }
    });*/

    this.cima_Service.buscar(this.terminoBusqueda, 1).subscribe({
      next: (data) => {
        // Guardamos todo el array (aprox 25 items)
        this.resultados = data.resultados || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo conectar con AEMPS', 'error');
      }
    });
  }

  // Función para avanzar o retroceder en los resultados que YA tenemos
  cambiarPaginaLocal(direccion: number) {
    this.paginaActual = this.paginaActual + direccion;
  }

  // Calcula cuántas páginas locales tenemos (ej: 25 / 8 = 4 páginas)
  get totalPaginasLocal(): number {
    return Math.ceil(this.resultados.length / this.itemsPorPagina);
  }

  // Emite el producto al Home para que lo mande al Almacén
  seleccionarProducto(producto: any) {
    this.importar.emit(producto);
  }

  regresar() {
    this.volver.emit();
  }
}
