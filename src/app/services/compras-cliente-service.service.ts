import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComprasCliente } from '../models/ComprasCliente';


@Injectable({
  providedIn: 'root'
})
export class ComprasClienteService {
  private apiUrl = 'http://localhost:5000/compras'; // URL base del backend

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Obtener todas las compras registradas
   */
  obtenerTodasLasCompras(): Observable<ComprasCliente[]> {
    return this.http.get<ComprasCliente[]>(`${this.apiUrl}/all`);
  }

  /**
   * 🔹 Obtener compras de un cliente específico por su DNI
   * @param dni - Número de identificación del cliente
   */
  obtenerComprasPorCliente(dni: string): Observable<ComprasCliente[]> {
    return this.http.get<ComprasCliente[]>(`${this.apiUrl}/cliente/${dni}`);
  }

  /**
   * 🔹 Obtener compras de un producto específico
   * @param producto - Nombre del producto
   */
  obtenerComprasPorProducto(producto: string): Observable<ComprasCliente[]> {
    return this.http.get<ComprasCliente[]>(`${this.apiUrl}/producto/${producto}`);
  }
  

  registrarComprasCliente(compras: ComprasCliente[]): Observable<ComprasCliente[]> {
    // Llamas al endpoint: POST /api/compras-cliente/registrar/list
    return this.http.post<ComprasCliente[]>(`${this.apiUrl}/registrar/list`, compras);
  }
}
