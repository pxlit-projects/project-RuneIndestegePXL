import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Post } from '../models/post.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrlPost}posts`;
  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('User', this.authService.getUserName())
      .set('Role', this.authService.getUserRole())
      .set('Content-Type', 'application/json');
  }

  private selectedPostSubject = new BehaviorSubject<Post | null>(null);
  public selectedPost$ = this.selectedPostSubject.asObservable();

  setSelectedPost(post: Post): void {
    this.selectedPostSubject.next(post);
  }
  clearSelectedPost(): void {
    this.selectedPostSubject.next(null);
  }
  createPostAsDraft(title: string, content: string): Observable<Post> {
    let post;

    if (this.selectedPostSubject.value) {
      this.selectedPostSubject.value.title = title;
      this.selectedPostSubject.value.content = content;
      post = this.selectedPostSubject.value;
    } else {
      post = { title, content };
    }
    return this.http.post<Post>(this.apiUrl, post, { headers: this.getHeaders() });
  }

  getDraftPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/draft/all`, { headers: this.getHeaders() });
  }

  submitPost(title: string, content: string): Observable<Post> {
    let post;

    if (this.selectedPostSubject.value) {
      this.selectedPostSubject.value.title = title;
      this.selectedPostSubject.value.content = content;
      post = this.selectedPostSubject.value;
    } else {
      post = { title, content };
    }
    return this.http.put<Post>(`${this.apiUrl}/submit`, post, { headers: this.getHeaders() });
  }

  correctPost(): Observable<Post> {
    const post = this.selectedPostSubject.getValue();
    return this.http.put<Post>(`${this.apiUrl}`, post, { headers: this.getHeaders() });
  }

  publishPost(id: number): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}/publish`, null, { headers: this.getHeaders() });
  }

  getPublishedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/published`,{ headers: this.getHeaders() });
  }

  getRejectedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/rejected`, { headers: this.getHeaders() });
  }

  getApprovedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/approved`, { headers: this.getHeaders() });
  }

  
}