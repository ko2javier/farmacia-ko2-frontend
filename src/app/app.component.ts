import { Component, OnInit } from '@angular/core';
import { ToastData, ToastService } from './services/toast.service';
import { Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private router: Router,
    private toastService: ToastService, private translate: TranslateService ) {
    // 3. CONFIGURAMOS EL IDIOMA
    this.translate.setDefaultLang('es'); // Idioma de respaldo
    this.translate.use('en');          // Idioma inicial
  }
    toast: ToastData | null = null;

  title = 'Auth_V3';

/** Aplico el toast de manera global !! */
  ngOnInit() {
    /*
  // console.log("🧹 Limpieza total realizada");
  localStorage.clear();
  sessionStorage.clear();*/

    this.toastService.toast$.subscribe((data: ToastData) => {
      this.toast = data;

      // Auto ocultar el toast después de 4 segundos
      setTimeout(() => {
        this.toast = null;
      }, 1200);
    });
  }

  closeToast() {
    this.toast = null; // Cierra el toast manualmente
  }


}
