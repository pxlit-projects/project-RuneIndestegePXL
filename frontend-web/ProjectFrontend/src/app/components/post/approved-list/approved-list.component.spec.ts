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
  //thought this would increase coverage but it did not :(
  it('should render posts and publish button', () => {
    const mockPosts = [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }];
    (postServiceMock.getApprovedPosts as jasmine.Spy).and.returnValue(of(mockPosts));
    component.ngOnInit();
    fixture.detectChanges();

    const postElements = fixture.nativeElement.querySelectorAll('app-post');
    expect(postElements.length).toBe(2);

    const publishButtons = fixture.nativeElement.querySelectorAll('button');
    expect(publishButtons.length).toBe(2);
  });

  it('should call publishPost when publish button is clicked', () => {
    const mockPosts = [{ id: 1, title: 'Post 1' }];
    (postServiceMock.getApprovedPosts as jasmine.Spy).and.returnValue(of(mockPosts));
    component.ngOnInit();
    fixture.detectChanges();

    const publishButton = fixture.nativeElement.querySelector('button');
    publishButton.click();

    expect(postServiceMock.publishPost).toHaveBeenCalledWith(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/posts']);
  });

  it('should display "No posts found" when there are no posts', () => {
    (postServiceMock.getApprovedPosts as jasmine.Spy).and.returnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();

    const noPostsMessage = fixture.nativeElement.querySelector('.text-center.text-gray-500');
    expect(noPostsMessage).toBeTruthy();
    expect(noPostsMessage.textContent).toContain('No posts found');
  });
});
