import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { VentaUsuario } from '../models/VentaUsuario';
import { VentaDTO } from '../models/VentaDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasUserService {

  private todasVentasUrl = `${environment.apiUrl}/ventas/all`;
  private ventasUrl      = `${environment.apiUrl}/ventas`;

  // BehaviorSubject que comparte la lista de ventas entre componentes en tiempo real
  private ventasSubject = new BehaviorSubject<VentaUsuario[]>([]);
  ventas$ = this.ventasSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Construye los headers con el token JWT para autenticar las peticiones
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Pide todas las ventas al backend y las guarda en el BehaviorSubject
  cargarVentas(): Observable<VentaUsuario[]> {
    return this.http.get<VentaUsuario[]>(this.todasVentasUrl, { headers: this.getHeaders() }).pipe(
      tap(ventas => this.ventasSubject.next(ventas))
    );
  }

  // Devuelve las ventas como Observable (sin hacer nueva petición al backend)
  obtenerVentas(): Observable<VentaUsuario[]> {
    return this.ventas$;
  }

  // Envía una lista de ventas al backend para registrarlas de golpe
  registrarVentas(ventas: VentaDTO[]): Observable<any> {
    return this.http.post(`${this.ventasUrl}/registrar/list`, ventas, { headers: this.getHeaders() });
  }

  // Cancela una venta por su ID y registra quién la canceló
  cancelarVenta(id: number, responsable: string): Observable<any> {
    const url = `${this.ventasUrl}/cancelar/${id}?responsable=${responsable}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }
}
