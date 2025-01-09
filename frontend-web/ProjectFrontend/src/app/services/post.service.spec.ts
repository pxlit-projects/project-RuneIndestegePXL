import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { AuthService } from './auth.service';
import { Post } from '../models/post.model';
import { environment } from '../../environments/environment';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getUserName', 'getUserRole']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PostService,
        { provide: AuthService, useValue: spy }
      ]
    });

    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authServiceSpy.getUserName.and.returnValue('testUser');
    authServiceSpy.getUserRole.and.returnValue('admin');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a post as draft', () => {
    const mockPost: Post = { title: 'Test Title', content: 'Test Content' };

    service.createPostAsDraft('Test Title', 'Test Content').subscribe(post => {
      expect(post).toEqual(mockPost);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts`);
    expect(req.request.method).toBe('POST');
    req.flush(mockPost);
  });

  it('should get a post by id', () => {
    const mockPost: Post = { title: 'Test Title', content: 'Test Content' };

    service.getPostById(1).subscribe(post => {
      expect(post).toEqual(mockPost);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPost);
  });

  it('should get draft posts', () => {
    const mockPosts: Post[] = [{ title: 'Test Title', content: 'Test Content' }];

    service.getDraftPosts().subscribe(posts => {
      expect(posts).toEqual(mockPosts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts/draft/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });

  it('should submit a post', () => {
    const mockPost: Post = { title: 'Test Title', content: 'Test Content' };

    service.submitPost('Test Title', 'Test Content').subscribe(post => {
      expect(post).toEqual(mockPost);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts/submit`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockPost);
  });

  it('should publish a post', () => {
    const mockPost: Post = { title: 'Test Title', content: 'Test Content' };

    service.publishPost(1).subscribe(post => {
      expect(post).toEqual(mockPost);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts/1/publish`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockPost);
  });

  it('should get published posts', () => {
    const mockPosts: Post[] = [{ title: 'Test Title', content: 'Test Content' }];

    service.getPublishedPosts().subscribe(posts => {
      expect(posts).toEqual(mockPosts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts/published`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });

  it('should get rejected posts', () => {
    const mockPosts: Post[] = [{ title: 'Test Title', content: 'Test Content' }];

    service.getRejectedPosts().subscribe(posts => {
      expect(posts).toEqual(mockPosts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts/rejected`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });

  it('should get approved posts', () => {
    const mockPosts: Post[] = [{ title: 'Test Title', content: 'Test Content' }];

    service.getApprovedPosts().subscribe(posts => {
      expect(posts).toEqual(mockPosts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/posts/approved`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });
});
