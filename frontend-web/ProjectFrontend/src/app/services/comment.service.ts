import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Comment as PostComment  } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrlComment}`;
  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('User', this.authService.getUserName())
      .set('Role', this.authService.getUserRole())
      .set('Content-Type', 'application/json');
  }


  createComment(postId : number, content : string): Observable<PostComment> {
    const comment = {
      postId: postId,
      content: content,
    }
    return this.http.post<PostComment>(this.apiUrl, comment, { headers: this.getHeaders() });
  }

  updateComment(id: number, content : string): Observable<PostComment> {
    const comment = {
      id: id,
      content: content,
    }
    return this.http.put<PostComment>(`${this.apiUrl}`, comment, { headers: this.getHeaders() });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getComments(postId : number): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`${this.apiUrl}/post/${postId}`, { headers: this.getHeaders() });
  }
}
