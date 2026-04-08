import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-help-modal',
  standalone: false,
  templateUrl: './help-modal.component.html',
  styleUrl: './help-modal.component.css'
})
export class HelpModalComponent {
  @Input() section: string = '';
  @Output() close = new EventEmitter<void>();

  get titleKey(): string {
    return `HELP.${this.section.toUpperCase()}.TITLE`;
  }

  get contentKey(): string {
    return `HELP.${this.section.toUpperCase()}.CONTENT`;
  }

  onClose(): void {
    this.close.emit();
  }
}
