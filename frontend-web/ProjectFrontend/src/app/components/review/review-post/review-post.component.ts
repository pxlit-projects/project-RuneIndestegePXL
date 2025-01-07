import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-review-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-post.component.html',
  styleUrls: ['./review-post.component.css']
})
export class ReviewPostComponent {
  review$: Observable<Review | null>;
  reviewForm: FormGroup;
  isApproved: boolean = true;

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.reviewForm = this.fb.group({
      review: ['', [Validators.required]]
    });
    this.review$ = this.reviewService.getSelectedReview();
  }

  approve(value: boolean) {
    this.isApproved = value;
    if (value) {
      this.reviewForm.get('review')?.clearValidators();
    } else {
      this.reviewForm.get('review')?.setValidators([Validators.required]);
    }
    this.reviewForm.get('review')?.updateValueAndValidity();
  }

  submitReview(review: Review) {
    if (this.reviewForm.valid) {
      const updatedReview: Review = {
        ...review,
        approved: this.isApproved,
        review: this.isApproved ? null : this.reviewForm.get('review')?.value
      };

      this.reviewService.createReview(updatedReview).subscribe({
        next: () => {
          this.router.navigate(['/reviews']);
        },
        error: (error) => {
          console.error('Error updating review:', error);
          this.snackBar.open('Error updating review', 'Close', {
            duration: 3000,
          });
        }
      });
    }
  }
}
