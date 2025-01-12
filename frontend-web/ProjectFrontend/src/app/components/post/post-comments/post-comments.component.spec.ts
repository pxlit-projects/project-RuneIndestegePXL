import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCommentsComponent } from './post-comments.component';
import { PostService } from '../../../services/post.service';
import { CommentService } from '../../../services/comment.service';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Post } from '../../../models/post.model';
import { Comment as PostComment } from '../../../models/comment.model';
import { FormsModule } from '@angular/forms';

describe('PostCommentsComponent', () => {
  let component: PostCommentsComponent;
  let fixture: ComponentFixture<PostCommentsComponent>;
  let postServiceMock: Partial<PostService>;
  let commentServiceMock: Partial<CommentService>;
  let authServiceMock: Partial<AuthService>;
  let routeMock: Partial<ActivatedRoute>;
  let mockPost: Post;
  let mockComments: PostComment[];

  beforeEach(async () => {
    mockPost = { id: 1, title: 'Test Post' } as Post;
    mockComments = [
      { id: 1, content: 'Test Comment 1', username: 'testUser' },
      { id: 2, content: 'Test Comment 2', username: 'otherUser' }
    ];

    postServiceMock = {
      getPostById: jasmine.createSpy('getPostById').and.returnValue(of(mockPost))
    };

    commentServiceMock = {
      getComments: jasmine.createSpy('getComments').and.returnValue(of(mockComments)),
      createComment: jasmine.createSpy('createComment').and.returnValue(of({})),
      deleteComment: jasmine.createSpy('deleteComment').and.returnValue(of({})),
      updateComment: jasmine.createSpy('updateComment').and.returnValue(of({}))
    };

    authServiceMock = {
      getUserName: jasmine.createSpy('getUserName').and.returnValue('testUser')
    };

    routeMock = {
      snapshot: {
        params: { id: 1 },
        url: [],
        queryParams: {},
        fragment: null,
        data: {},
        title: undefined,
        paramMap: jasmine.createSpyObj('paramMap', ['get']),
        queryParamMap: {} as ParamMap,
        outlet: 'primary',
        component: null,
        routeConfig: null,
        root: {} as ActivatedRouteSnapshot,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: []
      }
    };

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, PostCommentsComponent, FormsModule],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: CommentService, useValue: commentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with comments', () => {
    expect(commentServiceMock.getComments).toHaveBeenCalledWith(1);
  });

  it('should add a comment', () => {
    component.newCommentContent = 'New Comment';
    component.addComment();
    expect(commentServiceMock.createComment).toHaveBeenCalledWith(1, 'New Comment');
  });

  it('should delete a comment', () => {
    const comment = { id: 1, content: 'Test Comment', username: 'testUser' };
    component.deleteComment(comment);
    expect(commentServiceMock.deleteComment).toHaveBeenCalledWith(1);
  });

  it('should start editing a comment', () => {
    const comment = { id: 1, content: 'Test Comment', username: 'testUser' };
    component.startEdit(comment);
    expect(component.editingCommentId).toBe(1);
    expect(component.editedContent).toBe('Test Comment');
  });

  it('should save an edited comment', () => {
    const comment = { id: 1, content: 'Test Comment', username: 'testUser' };
    component.editedContent = 'Updated Comment';
    component.saveEdit(comment);
    expect(commentServiceMock.updateComment).toHaveBeenCalledWith(1, 'Updated Comment');
  });

  it('should cancel editing a comment', () => {
    component.cancelEdit();
    expect(component.editingCommentId).toBeNull();
    expect(component.editedContent).toBe('');
  });

  it('should show post component when post is loaded', () => {
    fixture.detectChanges();
    
    const postElement = fixture.debugElement.query(By.css('app-post'));
    expect(postElement).toBeTruthy();
  });

  it('should show "No comments yet" when comments array is empty', () => {
    (commentServiceMock.getComments as jasmine.Spy).and.returnValue(of([]));
    component.ngOnInit();
    fixture.detectChanges();
    
    const noCommentsElement = fixture.debugElement.query(By.css('.text-center'));
    expect(noCommentsElement.nativeElement.textContent).toContain('No comments yet');
  });

  it('should show edit/delete buttons only for current user comments', () => {
    fixture.detectChanges();
    
    const commentElements = fixture.debugElement.queryAll(By.css('.bg-gray-100'));
    
    const firstCommentButtons = commentElements[0].queryAll(By.css('button'));
    expect(firstCommentButtons.length).toBeGreaterThan(0);
    
    const secondCommentButtons = commentElements[1].queryAll(By.css('button'));
    expect(secondCommentButtons.length).toBe(0);
  });

  it('should show save/cancel buttons when editing and hide edit/delete buttons', () => {
    component.editingCommentId = mockComments[0].id;
    fixture.detectChanges();
    
    const saveButton = fixture.debugElement.query(By.css('button[class*="hover:text-green-700"]'));
    const cancelButton = fixture.debugElement.query(By.css('button[class*="hover:text-gray-700"]'));
    const editButton = fixture.debugElement.query(By.css('button[class*="hover:text-blue-700"]'));
    
    expect(saveButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();
    expect(editButton).toBeFalsy();
  });
});
