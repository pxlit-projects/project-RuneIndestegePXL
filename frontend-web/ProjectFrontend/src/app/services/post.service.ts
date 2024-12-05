import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post, PostUpdate, PostSearchCriteria } from '../models/post.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;

  getCurrentUser(): string {
    // In a real app, this would come from an auth service
    return 'testUser';
  }

  createPost(post: Post): Observable<Post> {
    const headers = new HttpHeaders().set('User', this.getCurrentUser());
    return this.http.post<Post>(this.apiUrl, post, { headers });
  }

  updatePost(id: number, post: PostUpdate): Observable<Post> {
    const headers = new HttpHeaders().set('User', this.getCurrentUser());
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post, { headers });
  }

  publishPost(id: number): Observable<Post> {
    const headers = new HttpHeaders().set('User', this.getCurrentUser());
    return this.http.put<Post>(`${this.apiUrl}/${id}/publish`, {}, { headers });
  }

  getPublishedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/published`);
  }
}