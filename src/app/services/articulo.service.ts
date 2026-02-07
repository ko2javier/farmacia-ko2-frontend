import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Articulo } from '../models/articulo';
import { UpdateDto } from '../models/UpdateDTO';
import { InsertDto } from '../models/InsertDto';


@Injectable({
  providedIn: 'root'
})
export class ArticuloService {
  private apiUrl = 'http://localhost:5000/articulos/All'; // URL del backend
  private apiUrl2 = 'http://localhost:5000/articulos'; // URL del backend


  constructor(private http: HttpClient) {}
  
// Comportamiento para almacenar los artículos en memoria y compartirlos entre componentes
private articulosSubject = new BehaviorSubject<Articulo[]>([]);
articulos$ = this.articulosSubject.asObservable(); // Observable para que otros componentes se suscriban



// Obtener artículos del backend y almacenarlos en memoria
cargarArticulos(): Observable<Articulo[]> {
  return this.http.get<Articulo[]>(this.apiUrl).pipe(
    tap((articulos: Articulo[]) => this.articulosSubject.next(articulos)) // Se especifica el tipo
  );
}

// Método para obtener los artículos almacenados (sin hacer nueva petición)
obtenerArticulos(): Articulo[] {
  return this.articulosSubject.value;
}

updateStock(codigo: string, updateDto: UpdateDto): Observable<Articulo> {
  return this.http.put<Articulo>(`${this.apiUrl}/updateStock/${codigo}`, updateDto);
}

// Para realizar un update de stock de un articulo!!

updateStockBatch(updates: UpdateDto []){
  return this.http.put<Articulo>(`${this.apiUrl2}/updateStock`, updates);

}
/**Para cambiar valores de precio y cantd en articulo */

updateItem(updates: UpdateDto ){
  return this.http.put<Articulo>(`${this.apiUrl2}/updateItem`, updates);

}

/**Para Crear un articulo nuevo */

insert_item(updates: InsertDto ){
  return this.http.post<Articulo>(`${this.apiUrl2}/insert`, updates);

}

/**Para eliminar un articulo */


deleteArticulo(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl2}/${id}`);
}


}
