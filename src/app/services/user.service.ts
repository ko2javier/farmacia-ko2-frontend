import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Usuarios } from '../models/usuarios';
import { HttpClient } from '@angular/common/http';
import { Insert_User_DTO } from '../models/Insert_User_DTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl     = `${environment.apiUrl}/users/all`;
  private apiUrlBase = `${environment.apiUrl}/users`;

  // BehaviorSubject que comparte la lista de usuarios entre componentes en tiempo real
  private usersSubject = new BehaviorSubject<Usuarios[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Pide todos los usuarios al backend y los guarda en el BehaviorSubject
  cargarUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(this.apiUrl).pipe(
      tap((usuarios: Usuarios[]) => this.usersSubject.next(usuarios))
    );
  }

  // Elimina un usuario por su ID
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlBase}/${id}`);
  }

  // Crea un nuevo usuario
  insertUser(dto: Insert_User_DTO) {
    return this.http.post<Usuarios>(`${this.apiUrlBase}/insert`, dto);
  }

  // Actualiza los datos de un usuario existente
  actualizarUsuario(usuario: Usuarios) {
    return this.http.put<Usuarios>(`${this.apiUrlBase}/update`, usuario);
  }
}
