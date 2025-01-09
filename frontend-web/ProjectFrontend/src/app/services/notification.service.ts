import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable, interval, switchMap } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api/`;
  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('User', this.authService.getUserName())
      .set('Role', this.authService.getUserRole())
      .set('Content-Type', 'application/json');
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}notifications`, { headers: this.getHeaders() });
  }

  pollNotifications(): Observable<Notification[]> {
    return interval(5000).pipe(
      switchMap(() => this.getNotifications())
    );
  }

  readAll(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}notifications`, {}, { headers: this.getHeaders() });
  }
}
