import { Component, OnInit } from '@angular/core';
import { ToastData, ToastService } from './services/toast.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  // Toast activo — null cuando no hay ninguno visible
  toast: ToastData | null = null;

  title = 'Auth_V3';

  constructor(
    private router: Router,
    private toastService: ToastService,
    private translate: TranslateService
  ) {
    // Idioma de respaldo si falta alguna clave en el idioma activo
    this.translate.setDefaultLang('es');
    // Idioma inicial al arrancar la app
    this.translate.use('en');
  }

  ngOnInit() {
    // Restauramos el tema guardado por el usuario
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
    }

    // Nos suscribimos al servicio de toasts para mostrarlos globalmente
    // y los ocultamos automáticamente después de 1.2 segundos
    this.toastService.toast$.subscribe((datos: ToastData) => {
      this.toast = datos;
      setTimeout(() => {
        this.toast = null;
      }, 1200);
    });
  }

  // Cierra el toast manualmente si el usuario hace clic en él
  closeToast() {
    this.toast = null;
  }
}
