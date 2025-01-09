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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-update',
  standalone: true,
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
  private router: Router = inject(Router);
  private fb: FormBuilder = inject(FormBuilder);
  post: Post = {
    title: '',
    content: ''
  };
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    this.postService.selectedPost$.subscribe(selectedPost => {
      if (selectedPost) {
        this.post = { ...selectedPost };
        this.postForm.setValue({
          title: this.post.title,
          content: this.post.content
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.postService.clearSelectedPost();
  }

  onSubmit(): void {
    if (this.postForm.invalid) return;
    const { title, content } = this.postForm.value;

    this.postService.submitPost(title, content).subscribe({
      next: () => this.router.navigate(['/posts']),
      error: (error) => {
        console.error('Error submitting post:', error);
        this.snackBar.open('Error submitting post', 'Close', { duration: 3000 });
      }
    });
  }

  saveDraft(): void {
    if (this.postForm.invalid) return;
    const { title, content } = this.postForm.value;

    this.postService.createPostAsDraft(title, content).subscribe({
      next: () => this.router.navigate(['/drafts']),
      error: (error) => {
        console.error('Error saving draft:', error);
        this.snackBar.open('Error saving draft', 'Close', { duration: 3000 });
      }
    });
  }
}