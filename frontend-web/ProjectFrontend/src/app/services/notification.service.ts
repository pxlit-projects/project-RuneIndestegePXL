import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrlPost}/notifications`;
    private getHeaders(): HttpHeaders {
      return new HttpHeaders()
        .set('User', this.authService.getUserName())
        .set('Role', this.authService.getUserRole())
        .set('Content-Type', 'application/json');
    }


    getNotifications(): Observable<Notification[]> {
      return this.http.get<Notification[]>(this.apiUrl, { headers: getHeaders() });
    }

    markAsRead(id: number): void {
      this.http.put(`${this.apiUrl}/${id}`, null, { headers: getHeaders() });
    }
}
