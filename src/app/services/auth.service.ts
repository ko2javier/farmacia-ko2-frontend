import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //private baseUrl = 'http://localhost:5000/auth'; // Cambia a la URL de tu backend
  private baseUrl = 'https://farmacia-ko2-back-production.up.railway.app/auth'; // Cambia a la URL de tu backend

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
