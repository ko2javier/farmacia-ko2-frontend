import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CimaService {
  private readonly API_URL = environment.apiCima;

  constructor(private http: HttpClient) { }

  // AHORA ACEPTA EL PARÁMETRO DE PÁGINA (por defecto la 1)
  buscarMedicamentos(nombre: string, pagina: number = 1): Observable<any> {
    // AÑADIMOS "&tamanioPagina=8" AL FINAL
    return this.http.get<any>(`${this.API_URL}?nombre=${nombre}&pagina=${pagina}&tamanioPagina=8`).pipe(
      map(response => {
        return {
          resultados: (response.resultados || []).map((med: any) => ({
            registro: med.nregistro,
            nombreOriginal: med.nombre,
            nombreCorto: this.limpiarNombre(med.nombre),
            laboratorio: med.labtitular,
            imagen: med.fotos && med.fotos.length > 0 ? med.fotos[0].url : null
          })),
          totalFilas: response.totalFilas,
          paginaActual: response.pagina,
          // CAMBIAMOS EL DIVISOR A 8
          totalPaginas: Math.ceil(response.totalFilas / 8)
        };
      })
    );
  }

  private limpiarNombre(nombre: string): string {
    if (!nombre) return '';
    let corto = nombre.split(/[,\(;]/)[0];
    return corto.replace(/EFG/g, '').trim(); // Limpieza extra
  }
}
