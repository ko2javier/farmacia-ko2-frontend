import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SugerenciaIA } from '../../models/SugerenciaIA';

@Component({
  selector: 'app-sugerencias-ia-modal',
  standalone: false,
  templateUrl: './sugerencias-ia-modal.component.html',
  styleUrl: './sugerencias-ia-modal.component.css'
})
export class SugerenciasIaModalComponent {

  // Lista de sugerencias que devuelve la IA para que el usuario elija una
  @Input() sugerencias: SugerenciaIA[] = [];

  // Emite la sugerencia que el usuario seleccionó
  @Output() seleccionar = new EventEmitter<SugerenciaIA>();

  // Emite cuando el usuario cancela sin seleccionar nada
  @Output() cancelar = new EventEmitter<void>();

  onSeleccionar(sugerencia: SugerenciaIA): void {
    this.seleccionar.emit(sugerencia);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
