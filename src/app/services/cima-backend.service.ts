import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CimaBackendService {

  private readonly BASE_URL = 'https://farmacia-ko2-back-production.up.railway.app/api/cima/buscar';
  private readonly MEDICAMENTO_URL = environment.apiCimaMedicamento;

  constructor(private http: HttpClient) { }

  /**
   * Busca medicamentos a través de tu servidor Java.
   * @param termino Nombre del medicamento (ej: "Paracetamol")
   * @param pagina Número de página (por defecto 1)
   */
  buscar(termino: string, pagina: number = 1): Observable<any> {
    // Construimos la URL: https://.../buscar?nombre=X&pagina=Y
    const url = `${this.BASE_URL}?nombre=${termino}&pagina=${pagina}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        // Transformamos la respuesta cruda de la AEMPS para que tu componente la entienda
        return {
          total: response.totalFilas,
          paginaActual: response.pagina,
          resultados: (response.resultados || []).map((item: any) => {
            return {
              // Mapeamos los campos raros de la AEMPS a los que usa tu componente
              registro: item.nregistro,
              nombreOriginal: item.nombre,
              nombreCorto: item.nombre, // Se lo pasamos tal cual (el componente ya tiene lógica para limpiar)
              laboratorio: item.labtitular,
              cimg: item.fotos && item.fotos.length > 0 ? item.fotos[0].url : null
            };
          })
        };
      })
    );
  }

  getByNregistro(nregistro: string): Observable<any> {
    return this.http.get<any>(`${this.MEDICAMENTO_URL}?nregistro=${nregistro}`).pipe(
      map(med => ({
        nregistro: med.nregistro,
        nombre: med.nombre,
        laboratorio: med.labtitular,
        principioActivo: (med.principiosActivos || []).map((p: any) => p.nombre).join(', '),
        formaFarmaceutica: med.formaFarmaceutica?.nombre || ''
      }))
    );
  }
}
