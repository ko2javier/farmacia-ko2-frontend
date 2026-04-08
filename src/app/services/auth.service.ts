import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const body = { username, password }; // Cuerpo de la solicitud
    return this.http.post(`${this.baseUrl}/login`, body);
  }

  saveToken(token: string): void {
    localStorage.setItem('jwtToken', token); // Guarda el token en el almacenamiento local

  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken'); // Recupera el token
  }

  logout(): void {
    localStorage.removeItem('jwtToken'); // Borra el token al cerrar sesión
  }


}
