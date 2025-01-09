import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private selectedReview$ = new BehaviorSubject<Review | null>(null);
  private apiUrl = `${environment.apiUrl}/api/reviews`;
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('User', this.authService.getUserName())
      .set('Role', this.authService.getUserRole())
      .set('Content-Type', 'application/json');
  }


    createReview(review: Review): Observable<Review> {
      return this.http.put<Review>(`${this.apiUrl}/${review.id}`, review, { headers : this.getHeaders() });
    }

    getReviews(): Observable<Review[]> {
      return this.http.get<Review[]>(`${this.apiUrl}`, { headers : this.getHeaders() });
    }
    setSelectedReview(review: Review) {
      review.approved = null;
      this.selectedReview$.next(review);
    }
  
    getSelectedReview(): Observable<Review | null> {
      return this.selectedReview$.asObservable();
    }
}
