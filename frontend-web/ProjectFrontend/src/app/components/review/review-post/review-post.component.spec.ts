import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ReviewService } from '../../../services/review.service';
import { ReviewPostComponent } from './review-post.component';
import { Review } from '../../../models/review.model';

describe('ReviewPostComponent', () => {
  let component: ReviewPostComponent;
  let fixture: ComponentFixture<ReviewPostComponent>;
  let reviewService: jasmine.SpyObj<ReviewService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const reviewServiceSpy = jasmine.createSpyObj('ReviewService', ['getSelectedReview', 'createReview']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ReviewPostComponent],
      providers: [
        { provide: ReviewService, useValue: reviewServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewPostComponent);
    component = fixture.componentInstance;
    reviewService = TestBed.inject(ReviewService) as jasmine.SpyObj<ReviewService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    reviewService.getSelectedReview.and.returnValue(of(null));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit review successfully', () => {
    const review: Review = { id: 1, review: 'Test review', approved: false , title: 'title', content:'content', author : 'author', postId: 1};
    component.reviewForm.setValue({ review: 'Test review' });
    reviewService.createReview.and.returnValue(of(review));

    component.submitReview(review);

    expect(reviewService.createReview).toHaveBeenCalledWith({
      ...review,
      approved: true,
      review: null
    });
    expect(router.navigate).toHaveBeenCalledWith(['/reviews']);
  });

  it('should handle error on review submission', () => {
    const review: Review = { id: 1, review: 'Test review', approved: false , title: 'title', content:'content', author : 'author', postId: 1};
    component.reviewForm.setValue({ review: 'Test review' });
    reviewService.createReview.and.returnValue(throwError(() => new Error('Error')));

    component.submitReview(review);

    expect(snackBar.open).toHaveBeenCalledWith('Error updating review', 'Close', { duration: 3000 });
  });
});
