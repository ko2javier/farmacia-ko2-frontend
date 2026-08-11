import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // Envía las credenciales al backend y recibe el token JWT si son correctas
  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.baseUrl}/login`, body);
  }

  // Guarda el token JWT en el localStorage tras el login
  saveToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  // Recupera el token JWT del localStorage (null si no hay sesión activa)
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // Borra el token del localStorage al cerrar sesión
  logout(): void {
    localStorage.removeItem('jwtToken');
  }
}
