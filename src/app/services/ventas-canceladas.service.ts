import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasCanceladasService {

  private apiUrl = `${environment.apiUrl}/cancelaciones`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Construye los headers con el token JWT para autenticar las peticiones
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Pide todas las cancelaciones al backend
  getCancelaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Registra una nueva cancelación en el backend
  registrarCancelacion(datos: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos, { headers: this.getHeaders() });
  }
}
