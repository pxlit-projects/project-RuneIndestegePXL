import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostListComponent } from './post-list.component';
import { PostService } from '../../../services/post.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Post } from '../../../models/post.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Filter } from '../../../models/filter.model';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  let postServiceMock: { getPublishedPosts: unknown; };
  let routerMock: { navigate: unknown; };

  beforeEach(async () => {
    postServiceMock = {
      getPublishedPosts: jasmine.createSpy('getPublishedPosts').and.returnValue(of([
        { id: 1, author: 'Author1', content: 'Content1', createdAt: new Date('2023-01-01') },
        { id: 2, author: 'Author2', content: 'Content2', createdAt: new Date('2023-06-01') }
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

  it('should filter posts by author', () => {
    const filter: Filter = { author: 'author1', content: '', startDate: undefined, endDate: undefined };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].author).toBe('Author1');
  });

  it('should filter posts by content', () => {
    const filter: Filter = { author: '', content: 'content2', startDate: undefined, endDate: undefined };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].content).toBe('Content2');
  });

  it('should filter posts by startDate', () => {
    const filter: Filter = { author: '', content: '', startDate: new Date('2023-01-01'), endDate: undefined };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(2);
  });

  it('should filter posts by endDate', () => {
    const filter: Filter = { author: '', content: '', startDate: undefined, endDate: new Date('2023-12-31') };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(2);
  });

  it('should filter posts by author and content', () => {
    const filter: Filter = { author: 'author1', content: 'content1', startDate: undefined, endDate: undefined };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].author).toBe('Author1');
    expect(component.filteredData[0].content).toBe('Content1');
  });

  it('should filter posts by author and startDate', () => {
    const filter: Filter = { author: 'author1', content: '', startDate: new Date('2023-01-01'), endDate: undefined };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].author).toBe('Author1');
  });

  it('should filter posts by author and endDate', () => {
    const filter: Filter = { author: 'author1', content: '', startDate: undefined, endDate: new Date('2023-12-31') };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].author).toBe('Author1');
  });

  it('should filter posts by content and startDate', () => {
    const filter: Filter = { author: '', content: 'content1', startDate: new Date('2023-01-01'), endDate: undefined };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].content).toBe('Content1');
  });

  it('should filter posts by content and endDate', () => {
    const filter: Filter = { author: '', content: 'content1', startDate: undefined, endDate: new Date('2023-12-31') };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].content).toBe('Content1');
  });

  it('should filter posts by startDate and endDate', () => {
    const filter: Filter = { author: '', content: '', startDate: new Date('2023-01-01'), endDate: new Date('2023-12-31') };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(2);
  });

  it('should filter posts by all criteria', () => {
    const filter: Filter = { author: 'author1', content: 'content1', startDate: new Date('2023-01-01'), endDate: new Date('2023-12-31') };
    component.handleFilter(filter);
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].author).toBe('Author1');
    expect(component.filteredData[0].content).toBe('Content1');
  });

});

