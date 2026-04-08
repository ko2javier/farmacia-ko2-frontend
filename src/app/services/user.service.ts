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
  private apiUrl = `${environment.apiUrl}/users/all`;
  private apiUrl2 = `${environment.apiUrl}/users`;

  // Almacena los usuarios en un BehaviorSubject para compartirlos entre componentes
  private usersSubject = new BehaviorSubject<Usuarios[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  cargarUsuarios(): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(this.apiUrl).pipe(
      tap((usuarios: Usuarios[]) => this.usersSubject.next(usuarios))
    );
  }

  
delete_user(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl2}/${id}`);
}

insertUser(dto: Insert_User_DTO) {
  return this.http.post<Usuarios>(`${this.apiUrl2}/insert`, dto);
}

Update_User(up_user: Usuarios) {
  return this.http.put<Usuarios>(`${this.apiUrl2}/update`, up_user);
}

}
