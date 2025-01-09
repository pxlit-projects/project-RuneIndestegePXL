import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostListComponent } from './post-list.component';
import { PostService } from '../../../services/post.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Post } from '../../../models/post.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  let postServiceMock: { getPublishedPosts: unknown; };
  let routerMock: { navigate: unknown; };

  beforeEach(async () => {
    postServiceMock = {
      getPublishedPosts: jasmine.createSpy('getPublishedPosts').and.returnValue(of([
        { id: 1, author: 'Author1', content: 'Content1', createdAt: new Date() },
        { id: 2, author: 'Author2', content: 'Content2', createdAt: new Date() }
      ]))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        PostListComponent
      ],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize posts and filteredData on ngOnInit', () => {
    component.ngOnInit();
    expect(postServiceMock.getPublishedPosts).toHaveBeenCalled();
    expect(component.posts.length).toBe(2);
    expect(component.filteredData.length).toBe(2);
  });

  it('should navigate to comments', () => {
    const post: Post = { id: 1, author: 'Author1', title: 'title',content: 'Content1', createdAt: new Date() };
    component.navigateToComments(post);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/post-comments', post.id]);
  });
/*
  it('should filter posts based on filter criteria', () => {
    const filter: Filter = { author: 'Author1', content: '', startDate: undefined, endDate: undefined };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].author).toBe('Author1');
  });
  */
});

