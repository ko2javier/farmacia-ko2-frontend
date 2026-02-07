import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { VentaUsuario } from '../models/VentaUsuario';
import { VentaDTO } from '../models/VentaDTO';

@Injectable({
  providedIn: 'root'
})
export class VentasUserService {
/*
  private apiUrl = 'http://localhost:5000/ventas/all';
  private sales_Url = 'http://localhost:5000/ventas';*/

  private apiUrl = 'https://distinguished-vibrancy-production.up.railway.app/ventas/all';
  private sales_Url = 'https://distinguished-vibrancy-production.up.railway.app/ventas';

  private ventasSubject = new BehaviorSubject<VentaUsuario[]>([]);
  ventas$ = this.ventasSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // 👇 ESTO ES LO QUE TE FALTABA O DABA ERROR ANTES
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  cargarVentas(): Observable<VentaUsuario[]> {
    return this.http.get<VentaUsuario[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(ventas => this.ventasSubject.next(ventas))
    );
  }

  obtenerVentas(): Observable<VentaUsuario[]> {
    return this.ventas$;
  }

  // 👇 AQUÍ ESTÁ EL MÉTODO QUE DICE QUE NO EXISTE
  registrarVentas(ventas: VentaDTO[]): Observable<any> {
    return this.http.post(`${this.sales_Url}/registrar/list`, ventas, { headers: this.getHeaders() });
  }

  cancelarVenta(id: number, responsable: string): Observable<any> {
    const url = `${this.sales_Url}/cancelar/${id}?responsable=${responsable}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }
}