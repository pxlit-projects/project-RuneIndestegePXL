import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { AuthService } from './auth.service';
import { Review } from '../models/review.model';
import { environment } from '../../environments/environment';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getUserName', 'getUserRole']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReviewService,
        { provide: AuthService, useValue: spy }
      ]
    });

    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authServiceSpy.getUserName.and.returnValue('testUser');
    authServiceSpy.getUserRole.and.returnValue('testRole');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a review', () => {
    const review: Review = { id: 1, content: 'Test Review', approved: true , author: 'testUser' , review: 'testReview', title: 'testTitle', postId: 1};
    service.createReview(review).subscribe(res => {
      expect(res).toEqual(review);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/reviews/${review.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('User')).toBe('testUser');
    expect(req.request.headers.get('Role')).toBe('testRole');
    req.flush(review);
  });

  it('should get reviews', () => {
    const reviews: Review[] = [{ id: 1, content: 'Test Review', approved: true , author: 'testUser' , review: 'testReview', title: 'testTitle', postId: 1}];
    service.getReviews().subscribe(res => {
      expect(res).toEqual(reviews);
    });

    const req = httpMock.expectOne(environment.apiUrl + '/api/reviews');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('User')).toBe('testUser');
    expect(req.request.headers.get('Role')).toBe('testRole');
    req.flush(reviews);
  });

  it('should set and get selected review', () => {
    const review: Review = { id: 1, content: 'Test Review', approved: true , author: 'testUser' , review: 'testReview', title: 'testTitle', postId: 1 };
    service.setSelectedReview(review);
    service.getSelectedReview().subscribe(res => {
      expect(res).toEqual({ ...review, approved: null });
    });
  });
});
