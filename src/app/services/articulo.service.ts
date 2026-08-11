import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Articulo } from '../models/articulo';
import { UpdateDto } from '../models/UpdateDTO';
import { InsertDto } from '../models/InsertDto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticuloService {

  private todasUrl   = `${environment.apiUrl}/articulos/All`;
  private apiUrlBase = `${environment.apiUrl}/articulos`;

  // BehaviorSubject que comparte la lista de artículos entre componentes en tiempo real
  private articulosSubject = new BehaviorSubject<Articulo[]>([]);
  articulos$ = this.articulosSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Pide todos los artículos al backend y los guarda en el BehaviorSubject
  cargarArticulos(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(this.todasUrl).pipe(
      tap((articulos: Articulo[]) => this.articulosSubject.next(articulos))
    );
  }

  // Devuelve los artículos que hay en memoria sin hacer nueva petición al backend
  obtenerArticulos(): Articulo[] {
    return this.articulosSubject.value;
  }

  // Actualiza el stock de un artículo individual por su código
  updateStock(codigo: string, dto: UpdateDto): Observable<Articulo> {
    return this.http.put<Articulo>(`${this.todasUrl}/updateStock/${codigo}`, dto);
  }

  // Actualiza el stock de varios artículos a la vez (tras una venta)
  updateStockBatch(actualizaciones: UpdateDto[]): Observable<Articulo> {
    return this.http.put<Articulo>(`${this.apiUrlBase}/updateStock`, actualizaciones);
  }

  // Actualiza precio y cantidad de un artículo
  updateItem(cambios: UpdateDto): Observable<Articulo> {
    return this.http.put<Articulo>(`${this.apiUrlBase}/updateItem`, cambios);
  }

  // Crea un artículo nuevo en el backend
  insert_item(nuevoArticulo: InsertDto): Observable<Articulo> {
    return this.http.post<Articulo>(`${this.apiUrlBase}/insert`, nuevoArticulo);
  }

  // Elimina un artículo por su ID
  deleteArticulo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlBase}/${id}`);
  }

  // Asocia un código AEMPS y laboratorio a un artículo existente
  patchAemps(id: number, aempsCode: string, laboratorio: string): Observable<Articulo> {
    return this.http.patch<Articulo>(`${this.apiUrlBase}/${id}/aemps`, { aempsCode, laboratorio });
  }

  // Actualiza un artículo en la lista local sin volver a llamar al backend
  actualizarArticuloLocal(actualizado: Articulo): void {
    const listaActualizada = this.articulosSubject.value.map(articulo =>
      articulo.id === actualizado.id ? actualizado : articulo
    );
    this.articulosSubject.next(listaActualizada);
  }
}
