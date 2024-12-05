import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PostService } from '../../services/post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css'
})
export class PostFormComponent {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);

  postForm = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required]
  });

  onSubmit() {
    if (this.postForm.valid) {
      const post = {
        ...this.postForm.value,
        status: 'DRAFT',
        author: this.postService.getCurrentUser()
      } as Post;

      this.postService.createPost(post).subscribe(() => {
        this.router.navigate(['/posts']);
      });
    }
  }

  saveAndPublish() {
    if (this.postForm.valid) {
      const post = {
        ...this.postForm.value,
        status: 'PUBLISHED',
        author: this.postService.getCurrentUser()
      } as Post;

      this.postService.createPost(post).subscribe(() => {
        this.router.navigate(['/posts']);
      });
    }
  }
}
