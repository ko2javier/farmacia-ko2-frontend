import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityLog } from '../models/activity-log.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {

  private baseUrl = `${environment.apiUrl}/activity-log`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/all`);
  }
}
