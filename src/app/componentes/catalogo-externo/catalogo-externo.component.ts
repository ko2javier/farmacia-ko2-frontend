import { Component, EventEmitter, Output } from '@angular/core';
import { CimaService } from '../../services/cima.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo-externo',
  standalone: false,
  templateUrl: './catalogo-externo.component.html',
  styleUrls: ['./catalogo-externo.component.css']
})
export class CatalogoExternoComponent {

  terminoBusqueda: string = '';
  resultados: any[] = [];
  cargando: boolean = false;

  // Paginación local — los 25 resultados de AEMPS se dividen en páginas de 8
  paginaActual: number = 1;
  itemsPorPagina: number = 8;

  // Emite el producto seleccionado al componente padre (home) para importarlo al almacén
  @Output() importar = new EventEmitter<any>();
  @Output() volver   = new EventEmitter<void>();

  constructor(private cimaService: CimaService) {}

  // Busca medicamentos en AEMPS por nombre y guarda los resultados localmente
  buscar() {
    if (this.terminoBusqueda.trim().length < 3) return;

    this.cargando   = true;
    this.paginaActual = 1;
    this.resultados = [];

    this.cimaService.buscarMedicamentos(this.terminoBusqueda, 1).subscribe({
      next: (data) => {
        this.resultados = data.resultados || [];
        this.cargando   = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo conectar con AEMPS', 'error');
      }
    });
  }

  // Avanza o retrocede entre las páginas de los resultados ya cargados
  cambiarPaginaLocal(direccion: number) {
    this.paginaActual = this.paginaActual + direccion;
  }

  // Getter: calcula cuántas páginas hay con los resultados actuales
  get totalPaginasLocal(): number {
    return Math.ceil(this.resultados.length / this.itemsPorPagina);
  }

  // Envía el producto seleccionado al home para pasarlo al almacén
  seleccionarProducto(producto: any) {
    this.importar.emit(producto);
  }

  // Vuelve a la sección anterior
  regresar() {
    this.volver.emit();
  }
}
