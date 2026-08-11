import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Articulo } from '../../models/articulo';
import { ArticuloService } from '../../services/articulo.service';
import { CimaBackendService } from '../../services/cima-backend.service';
import { CimaService } from '../../services/cima.service';

declare var bootstrap: any;

@Component({
  selector: 'app-articulo-detalle-modal',
  standalone: false,
  templateUrl: './articulo-detalle-modal.component.html',
  styleUrl: './articulo-detalle-modal.component.css'
})
export class ArticuloDetalleModalComponent {

  // Referencia al elemento HTML del modal de Bootstrap
  @ViewChild('modalEl') modalEl!: ElementRef;

  // Emite al padre cuando el artículo se actualiza con datos de AEMPS
  @Output() articuloActualizado = new EventEmitter<Articulo>();

  // Artículo que se está mostrando en el modal
  articulo: Articulo | null = null;
  private bsModal: any = null;

  // Estado cuando el artículo ya tiene código AEMPS — cargamos sus datos
  cargandoAemps: boolean = false;
  aempsData: any = null;
  errorAemps: string = '';

  // Estado cuando el artículo NO tiene código AEMPS — mostramos un buscador
  terminoBusqueda: string = '';
  buscando: boolean = false;
  resultadosBusqueda: any[] = [];
  guardando: boolean = false;

  constructor(
    private articuloService: ArticuloService,
    private cimaBackendService: CimaBackendService,
    private cimaService: CimaService
  ) {}

  // Abre el modal con el artículo recibido y carga sus datos de AEMPS si los tiene
  abrir(articulo: Articulo): void {
    this.articulo = articulo;
    this.resetEstado();

    if (!this.bsModal) {
      this.bsModal = new bootstrap.Modal(this.modalEl.nativeElement);
    }
    this.bsModal.show();

    if (articulo.aempsCode) {
      this.cargarDatosAemps(articulo.aempsCode);
    }
  }

  // Cierra el modal
  cerrar(): void {
    this.bsModal?.hide();
  }

  // Limpia todos los estados antes de abrir un nuevo artículo
  private resetEstado(): void {
    this.aempsData          = null;
    this.errorAemps         = '';
    this.terminoBusqueda    = '';
    this.resultadosBusqueda = [];
    this.cargandoAemps      = false;
    this.buscando           = false;
    this.guardando          = false;
  }

  // Pide los datos del medicamento a AEMPS usando su número de registro
  private cargarDatosAemps(nregistro: string): void {
    this.cargandoAemps = true;
    this.errorAemps    = '';

    this.cimaBackendService.getByNregistro(nregistro).subscribe({
      next: (datos) => {
        this.aempsData     = datos;
        this.cargandoAemps = false;
      },
      error: () => {
        this.errorAemps    = 'No se pudo obtener la información de AEMPS.';
        this.cargandoAemps = false;
      }
    });
  }

  // Busca medicamentos en AEMPS por nombre para asociarlos al artículo
  buscarAemps(): void {
    if (this.terminoBusqueda.trim().length < 3) return;

    this.buscando           = true;
    this.resultadosBusqueda = [];

    this.cimaService.buscarMedicamentos(this.terminoBusqueda, 1).subscribe({
      next: (data) => {
        this.resultadosBusqueda = data.resultados || [];
        this.buscando           = false;
      },
      error: () => {
        this.buscando = false;
      }
    });
  }

  // Asocia el medicamento seleccionado al artículo y guarda el código AEMPS en el backend
  seleccionarMedicamento(resultado: any): void {
    if (!this.articulo) return;

    this.guardando = true;

    this.articuloService.patchAemps(this.articulo.id, resultado.registro, resultado.laboratorio).subscribe({
      next: (articuloActualizado) => {
        this.articuloService.actualizarArticuloLocal(articuloActualizado);
        this.articuloActualizado.emit(articuloActualizado);
        this.articulo           = articuloActualizado;
        this.guardando          = false;
        this.resultadosBusqueda = [];
        this.terminoBusqueda    = '';
        this.cargarDatosAemps(articuloActualizado.aempsCode!);
      },
      error: () => {
        this.guardando = false;
      }
    });
  }
}
