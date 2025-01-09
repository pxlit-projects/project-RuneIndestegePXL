import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApprovedListComponent } from './approved-list.component';
import { PostService } from '../../../services/post.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('ApprovedListComponent', () => {
  let component: ApprovedListComponent;
  let fixture: ComponentFixture<ApprovedListComponent>;
  let postServiceMock: Partial<PostService>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    postServiceMock = {
      getApprovedPosts: jasmine.createSpy('getApprovedPosts').and.returnValue(of([])),
      publishPost: jasmine.createSpy('publishPost').and.returnValue(of({}))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [ApprovedListComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Router, useValue: routerMock },
        provideRouter([])
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch approved posts on init', () => {
    component.ngOnInit();
    expect(postServiceMock.getApprovedPosts).toHaveBeenCalled();
    component.posts.subscribe(posts => {
      expect(posts).toEqual([]);
    });
  });

  it('should publish a post and navigate to /posts', () => {
    const postId = 1;
    component.publishPost(postId);
    expect(postServiceMock.publishPost).toHaveBeenCalledWith(postId);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/posts']);
  });
});
