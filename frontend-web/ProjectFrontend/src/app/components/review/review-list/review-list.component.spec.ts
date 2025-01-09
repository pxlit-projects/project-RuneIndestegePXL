import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ReviewListComponent } from './review-list.component';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../models/review.model';

describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;
  let reviewServiceMock: Partial<ReviewService>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    reviewServiceMock = {
      getReviews: jasmine.createSpy('getReviews').and.returnValue(of([])),
      setSelectedReview: jasmine.createSpy('setSelectedReview')
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      declarations: [ReviewListComponent],
      providers: [
        { provide: ReviewService, useValue: reviewServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch reviews on init', () => {
    component.ngOnInit();
    expect(reviewServiceMock.getReviews).toHaveBeenCalled();
    component.reviews$?.subscribe(reviews => {
      expect(reviews).toEqual([]);
    });
  });

  it('should navigate to review-post on selectReview', () => {
    const review: Review = { id: 1, review: 'review', title: 'title', content : 'content', author: 'author', postId: 1, approved: true };
    component.selectReview(review);
    expect(reviewServiceMock.setSelectedReview).toHaveBeenCalledWith(review);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/review-post']);
  });
});
