import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-help-modal',
  standalone: false,
  templateUrl: './help-modal.component.html',
  styleUrl: './help-modal.component.css'
})
export class HelpModalComponent {

  // Sección para la que se muestra la ayuda (ej: 'warehouse', 'cart')
  @Input() section: string = '';

  // Emite al padre cuando el usuario cierra el panel
  @Output() close = new EventEmitter<void>();

  // Construye la clave de traducción del título según la sección
  get titleKey(): string {
    return `HELP.${this.section.toUpperCase()}.TITLE`;
  }

  // Construye la clave de traducción del contenido según la sección
  get contentKey(): string {
    return `HELP.${this.section.toUpperCase()}.CONTENT`;
  }

  // Notifica al padre que el usuario quiere cerrar el panel
  onClose(): void {
    this.close.emit();
  }
}
