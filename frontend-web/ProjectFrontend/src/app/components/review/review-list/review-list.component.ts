import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})

export class ReviewListComponent implements OnInit {
  reviews$: Observable<Review[]> | undefined;
  public router = inject(Router);
  public reviewService = inject(ReviewService);

  ngOnInit() {
    this.reviews$ = this.reviewService.getReviews();
  }

  selectReview(review: Review) {
    this.reviewService.setSelectedReview(review);
    this.router.navigate(['/review-post']);
  }
}
