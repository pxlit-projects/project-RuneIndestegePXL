import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-update',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './create-update.component.html',
  styleUrls: ['./create-update.component.css']
})
export class CreateUpdateComponent implements OnInit {
  private postService: PostService = inject(PostService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  post: Post = {
    title: '',
    content: ''
  };
  isEdit = false;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postService.selectedPost$.subscribe(selectedPost => {
      if (selectedPost) {
        this.post = { ...selectedPost };
        this.isEdit = true;
      }
    });
  }

  onSubmit(isValid: boolean): void {
    if (!isValid) return;

    this.postService.submitPost(this.post.title, this.post.content).subscribe({
      next: () => this.router.navigate(['/posts']),
      error: (error) => {
        console.error('Error submitting post:', error);
        this.snackBar.open('Error submitting post', 'Close', { duration: 3000 });
      }
    });
  }

  saveDraft(): void {
    this.postService.createPostAsDraft(this.post.title, this.post.content).subscribe({
      next: () => this.router.navigate(['/drafts']),
      error: (error) => {
        console.error('Error saving draft:', error);
        this.snackBar.open('Error saving draft', 'Close', { duration: 3000 });
      }
    });
  }
}