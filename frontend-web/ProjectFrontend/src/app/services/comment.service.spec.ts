import { TestBed } from '@angular/core/testing';
import { CommentService } from './comment.service';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Comment } from '../models/comment.model';
import { provideHttpClient } from '@angular/common/http';

describe('Service: Comment', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getUserName', 'getUserRole']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
          CommentService,
        { provide: AuthService, useValue: spy }
      ]
    });

    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a comment', () => {
    const dummyComment: Comment = { id: 1, username: 'name', content: 'Test comment' };
    authServiceSpy.getUserName.and.returnValue('testUser');
    authServiceSpy.getUserRole.and.returnValue('user');

    service.createComment(1, 'Test comment').subscribe(comment => {
      expect(comment).toEqual(dummyComment);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/comments`);
    expect(req.request.method).toBe('POST');
    req.flush(dummyComment);
  });

  it('should update a comment', () => {
    const dummyComment: Comment = { id: 1, username: 'name', content: 'Updated comment' };
    authServiceSpy.getUserName.and.returnValue('testUser');
    authServiceSpy.getUserRole.and.returnValue('user');

    service.updateComment(1, 'Updated comment').subscribe(comment => {
      expect(comment).toEqual(dummyComment);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/comments`);
    expect(req.request.method).toBe('PUT');
    req.flush(dummyComment);
  });

  it('should delete a comment', () => {
    authServiceSpy.getUserName.and.returnValue('testUser');
    authServiceSpy.getUserRole.and.returnValue('user');

    service.deleteComment(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/comments/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get comments', () => {
    const dummyComments: Comment[] = [
      { id: 1, username: 'name', content: 'Test comment 1' },
      { id: 2, username: 'name', content: 'Test comment 2' }
    ];
    authServiceSpy.getUserName.and.returnValue('testUser');
    authServiceSpy.getUserRole.and.returnValue('user');

    service.getComments(1).subscribe(comments => {
      expect(comments.length).toBe(2);
      expect(comments).toEqual(dummyComments);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/comments/post/1`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyComments);
  });
});
