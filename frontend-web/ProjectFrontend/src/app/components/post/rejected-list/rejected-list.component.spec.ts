import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RejectedListComponent } from './rejected-list.component';
import { PostService } from '../../../services/post.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Post } from '../../../models/post.model';

describe('RejectedListComponent', () => {
  let component: RejectedListComponent;
  let fixture: ComponentFixture<RejectedListComponent>;
  let postServiceMock: Partial<PostService>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    postServiceMock = {
      getRejectedPosts: jasmine.createSpy('getRejectedPosts').and.returnValue(of([])),
      setSelectedPost: jasmine.createSpy('setSelectedPost')
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [RejectedListComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch rejected posts on init', () => {
    component.ngOnInit();
    expect(postServiceMock.getRejectedPosts).toHaveBeenCalled();
    component.posts.subscribe(posts => {
      expect(posts).toEqual([]);
    });
  });

  it('should navigate to edit menu with selected post', () => {
    const post: Post = { id: 1, title: 'Test Post', content: 'Test Content' };
    component.navigateToEditMenu(post);
    expect(postServiceMock.setSelectedPost).toHaveBeenCalledWith(post);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/create-update']);
  });
});
