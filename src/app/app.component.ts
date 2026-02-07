import { Component, OnInit } from '@angular/core';
import { ToastData, ToastService } from './services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private router: Router, 
    private toastService: ToastService ) {}
    toast: ToastData | null = null;

  title = 'Auth_V3';

/** Aplico el toast de manera global !! */
  ngOnInit() {
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
