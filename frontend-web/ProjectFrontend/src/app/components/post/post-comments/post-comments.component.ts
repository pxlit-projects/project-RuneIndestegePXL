import { Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Post } from '../../../models/post.model';
import { CommentService } from '../../../services/comment.service';
import { switchMap } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment  as PostComment} from '../../../models/comment.model';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { PostComponent } from '../post/post.component';
@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [AsyncPipe, FormsModule, AsyncPipe, MatIcon, PostComponent],
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.css']
})
export class PostCommentsComponent implements OnInit {
  public postService = inject(PostService);
  public commentService = inject(CommentService);
  public authService = inject(AuthService);
  public snackBar = inject(MatSnackBar);

  public currentUser = this.authService.getUserName();
  public comments: Observable<PostComment[]> = of([]);  
  public newCommentContent: string = '';
  public editingCommentId: number | null = null;
  public editedContent: string = '';

  private refreshComments$ = new BehaviorSubject<void>(undefined);

  route: ActivatedRoute = inject(ActivatedRoute);
  id: number = this.route.snapshot.params['id'];
  observablePost$: Observable<Post> = this.postService.getPostById(this.id);

  ngOnInit(): void {    
    this.refreshComments();
  }

  private refreshComments(): void {
    this.comments = this.refreshComments$.pipe(
      switchMap(() => {
        if (this.id) {
          return this.commentService.getComments(this.id);
        }
        return of([]);
      })
    );
  
  }

  addComment(): void {
    if (this.id) {
      this.commentService.createComment(this.id, this.newCommentContent).subscribe({
        next: () => {
          this.newCommentContent = '';
          this.refreshComments$.next();
        },
        error: (err) => {
          console.error('Failed to add comment:', err);
          this.snackBar.open('Failed to add comment', 'Close', {
            duration: 3000,
            });
        },
      });
    }
  }
  

  deleteComment(comment: PostComment): void {
    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        this.refreshComments();
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        this.snackBar.open('Error deleting comment', 'Close', {
          duration: 3000,
          });
      }
    });
  }

  startEdit(comment: PostComment): void {
    this.editingCommentId = comment.id;
    this.editedContent = comment.content;
  }

  saveEdit(comment: PostComment): void {
    if (this.editedContent.trim()) {
      this.commentService.updateComment(comment.id, this.editedContent).subscribe({
        next: () => {
          this.editingCommentId = null;
          this.editedContent = '';
          this.refreshComments$.next();
        },
        error: (err) => {
            console.error('Error updating comment:', err);
            this.snackBar.open('Error updating comment', 'Close', {
            duration: 3000,
            });
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editedContent = '';
  }
}
