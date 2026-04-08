import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SugerenciaIA } from '../../models/SugerenciaIA';

@Component({
  selector: 'app-sugerencias-ia-modal',
  standalone: false,
  templateUrl: './sugerencias-ia-modal.component.html',
  styleUrl: './sugerencias-ia-modal.component.css'
})
export class SugerenciasIaModalComponent {
  @Input() sugerencias: SugerenciaIA[] = [];
  @Output() seleccionar = new EventEmitter<SugerenciaIA>();
  @Output() cancelar = new EventEmitter<void>();

  onSeleccionar(sugerencia: SugerenciaIA): void {
    this.seleccionar.emit(sugerencia);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
