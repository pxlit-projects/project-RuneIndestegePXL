import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCommentsComponent } from './post-comments.component';
import { PostService } from '../../../services/post.service';
import { CommentService } from '../../../services/comment.service';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap } from '@angular/router';
import { of } from 'rxjs';

describe('PostCommentsComponent', () => {
  let component: PostCommentsComponent;
  let fixture: ComponentFixture<PostCommentsComponent>;
  let postServiceMock: Partial<PostService>;
  let commentServiceMock: Partial<CommentService>;
  let authServiceMock: Partial<AuthService>;
  let routeMock: Partial<ActivatedRoute>;

  beforeEach(async () => {
    postServiceMock = {
      getPostById: jasmine.createSpy('getPostById').and.returnValue(of({ id: 1, title: 'Test Post' }))
    };

    commentServiceMock = {
      getComments: jasmine.createSpy('getComments').and.returnValue(of([])),
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
      imports: [MatSnackBarModule, PostCommentsComponent],
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
});
