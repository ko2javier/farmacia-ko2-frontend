import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ValidarIaService {
  constructor(private http: HttpClient) {}

  validar(nombre: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/cima/validar?nombre=${encodeURIComponent(nombre)}`);
  }
}
