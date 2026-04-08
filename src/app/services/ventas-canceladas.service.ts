import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Importamos para pillar el token
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasCanceladasService {

  private apiUrl = `${environment.apiUrl}/cancelaciones`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método privado para meter el Token en la cabecera
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Usamos tu método existente
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // 1. Obtener todas las cancelaciones (GET)
  getCancelaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // 2. Guardar una nueva cancelación (POST)
  // Este lo usaremos luego cuando conectemos el botón de borrar venta
  registrarCancelacion(datos: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos, { headers: this.getHeaders() });
  }
}