import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CimaBackendService {

  private readonly busquedaUrl     = environment.apiCima;
  private readonly medicamentoUrl  = environment.apiCimaMedicamento;

  constructor(private http: HttpClient) {}

  // Busca medicamentos por nombre a través del proxy Java
  // Transforma la respuesta cruda de AEMPS al formato que usan los componentes
  buscar(termino: string, pagina: number = 1): Observable<any> {
    const url = `${this.busquedaUrl}?nombre=${termino}&pagina=${pagina}`;

    return this.http.get<any>(url).pipe(
      map(respuesta => ({
        total:        respuesta.totalFilas,
        paginaActual: respuesta.pagina,
        resultados:   (respuesta.resultados || []).map((medicamento: any) => ({
          registro:       medicamento.nregistro,
          nombreOriginal: medicamento.nombre,
          nombreCorto:    medicamento.nombre,
          laboratorio:    medicamento.labtitular,
          cimg:           medicamento.fotos && medicamento.fotos.length > 0 ? medicamento.fotos[0].url : null
        }))
      }))
    );
  }

  // Pide el detalle completo de un medicamento por su número de registro AEMPS
  getByNregistro(nregistro: string): Observable<any> {
    return this.http.get<any>(`${this.medicamentoUrl}?nregistro=${nregistro}`).pipe(
      map(medicamento => ({
        nregistro:         medicamento.nregistro,
        nombre:            medicamento.nombre,
        laboratorio:       medicamento.labtitular,
        principioActivo:   (medicamento.principiosActivos || []).map((principio: any) => principio.nombre).join(', '),
        formaFarmaceutica: medicamento.formaFarmaceutica?.nombre || ''
      }))
    );
  }
}
