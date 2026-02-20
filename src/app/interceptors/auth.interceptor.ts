import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {} // Necesitamos el Router para redirigir

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwtToken');

    let clonedRequest = request;

    if (token) {
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Usamos pipe y catchError para escuchar la respuesta del servidor
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 (No autorizado) o 403 (Prohibido/Token expirado en Spring)
        if (error.status === 401 || error.status === 403) {
          console.warn('Acceso denegado o sesión expirada. Limpiando datos...');

          // 1. Borramos el token para que no estorbe más
          localStorage.removeItem('jwtToken');

          // 2. Mandamos al usuario al login de inmediato
          this.router.navigate(['/login']);
        }

        // Devolvemos el error para que otros servicios puedan leerlo si es necesario
        return throwError(() => error);
      })
    );
  }
}
