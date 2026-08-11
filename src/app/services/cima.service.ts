import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CimaService {

  private readonly apiUrl = environment.apiCima;

  constructor(private http: HttpClient) {}

  // Busca medicamentos en AEMPS por nombre y página
  // Transforma la respuesta cruda al formato que usan los componentes
  buscarMedicamentos(nombre: string, pagina: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?nombre=${nombre}&pagina=${pagina}&tamanioPagina=8`).pipe(
      map(respuesta => ({
        resultados: (respuesta.resultados || []).map((medicamento: any) => ({
          registro:       medicamento.nregistro,
          nombreOriginal: medicamento.nombre,
          nombreCorto:    this.limpiarNombre(medicamento.nombre),
          laboratorio:    medicamento.labtitular,
          imagen:         medicamento.fotos && medicamento.fotos.length > 0 ? medicamento.fotos[0].url : null
        })),
        totalFilas:   respuesta.totalFilas,
        paginaActual: respuesta.pagina,
        totalPaginas: Math.ceil(respuesta.totalFilas / 8)
      }))
    );
  }

  // Elimina información farmacéutica genérica del nombre para dejarlo más corto y limpio
  private limpiarNombre(nombre: string): string {
    if (!nombre) return '';
    let nombreCorto = nombre.split(/[,\(;]/)[0];
    return nombreCorto.replace(/EFG/g, '').trim();
  }
}
