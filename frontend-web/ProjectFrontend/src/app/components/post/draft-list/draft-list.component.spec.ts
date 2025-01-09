import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraftListComponent } from './draft-list.component';
import { PostService } from '../../../services/post.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Post } from '../../../models/post.model';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

describe('DraftListComponent', () => {
  let component: DraftListComponent;
  let fixture: ComponentFixture<DraftListComponent>;
  let postServiceMock: Partial<PostService>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    postServiceMock = {
      getDraftPosts: jasmine.createSpy('getDraftPosts').and.returnValue(of([])),
      setSelectedPost: jasmine.createSpy('setSelectedPost'),
      clearSelectedPost: jasmine.createSpy('clearSelectedPost')
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [DraftListComponent, AsyncPipe, DatePipe, MatButtonModule],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DraftListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch draft posts on init', () => {
    component.ngOnInit();
    expect(postServiceMock.getDraftPosts).toHaveBeenCalled();
    component.posts.subscribe(posts => {
      expect(posts).toEqual([]);
    });
  });

  it('should navigate to draft on navigateToDraft', () => {
    const post: Post = { id: 1, title: 'Test Post', content: 'Test Content' };
    component.navigateToDraft(post);
    expect(postServiceMock.setSelectedPost).toHaveBeenCalledWith(post);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/create-update']);
  });

  it('should navigate to new draft on navigateToNewDraft', () => {
    component.navigateToNewDraft();
    expect(postServiceMock.clearSelectedPost).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/create-update']);
  });
});
