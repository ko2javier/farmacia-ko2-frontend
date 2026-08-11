import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastData {
  title: string;
  subTitle?: string;
  message: string;
  isError: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // Subject que emite cada vez que se quiere mostrar un toast
  private toastSubject = new Subject<ToastData>();

  // Observable que los componentes usan para suscribirse y recibir los toasts
  toast$ = this.toastSubject.asObservable();

  constructor() {}

  // Lanza un toast con título, mensaje y tipo (error o éxito)
  showToast(title: string, message: string, isError: boolean, subTitle?: string) {
    this.toastSubject.next({ title, subTitle, message, isError });
  }
}
