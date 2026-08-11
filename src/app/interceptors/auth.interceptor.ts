import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  // Intercepta todas las peticiones HTTP de la app
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwtToken');

    // Si hay token, lo añadimos a la cabecera de la petición
    let peticionFinal = request;
    if (token) {
      peticionFinal = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(peticionFinal).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el token expiró o no es válido, borramos la sesión y mandamos al login
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('jwtToken');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
