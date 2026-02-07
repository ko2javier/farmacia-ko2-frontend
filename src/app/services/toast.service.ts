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

  private toastSubject = new Subject<ToastData>(); // Observable para emitir los datos del toast
  toast$ = this.toastSubject.asObservable(); // Exponemos el observable para que otros componentes puedan suscribirse

  constructor() {}

  showToast(title: string, message: string, isError: boolean, subTitle?: string) {
    const toastData: ToastData = {
      title,
      subTitle,
      message,
      isError
    };
    this.toastSubject.next(toastData); // Emitimos los datos del toast
  }
}
