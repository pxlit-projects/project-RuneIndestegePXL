import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { CreateUpdateComponent } from './create-update.component';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

describe('CreateUpdateComponent', () => {
  let component: CreateUpdateComponent;
  let fixture: ComponentFixture<CreateUpdateComponent>;
  let postService: jasmine.SpyObj<PostService>;
  let router: jasmine.SpyObj<Router>;
  let selectedPostSubject: Subject<Partial<Post>>;

  beforeEach(async () => {
    selectedPostSubject = new Subject();
    const postServiceSpy = jasmine.createSpyObj('PostService', ['submitPost', 'createPostAsDraft', 'clearSelectedPost'], {
      selectedPost$: selectedPostSubject.asObservable()
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSnackBarModule, BrowserAnimationsModule, CreateUpdateComponent],
      providers: [
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideRouter([])
      ]
    }).compileComponents();

    postService = TestBed.inject(PostService) as jasmine.SpyObj<PostService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.postForm.value).toEqual({ title: '', content: '' });
  });

  it('should submit the form successfully', () => {
    component.postForm.setValue({ title: 'Test Title', content: 'Test Content' });
    postService.submitPost.and.returnValue(of({ title: 'Test Title', content: 'Test Content' }));

    component.onSubmit();

    expect(postService.submitPost).toHaveBeenCalledWith('Test Title', 'Test Content');
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
  });

  it('should handle form submission error', () => {
    component.postForm.setValue({ title: 'Test Title', content: 'Test Content' });
    postService.submitPost.and.returnValue(throwError('Error'));

    component.onSubmit();

    expect(postService.submitPost).toHaveBeenCalledWith('Test Title', 'Test Content');
  });

  it('should save the draft successfully', () => {
    component.postForm.setValue({ title: 'Draft Title', content: 'Draft Content' });
    postService.createPostAsDraft.and.returnValue(of({ title: 'Draft Title', content: 'Draft Content' }));

    component.saveDraft();

    expect(postService.createPostAsDraft).toHaveBeenCalledWith('Draft Title', 'Draft Content');
    expect(router.navigate).toHaveBeenCalledWith(['/drafts']);
  });

  it('should handle draft saving error', () => {
    component.postForm.setValue({ title: 'Draft Title', content: 'Draft Content' });
    postService.createPostAsDraft.and.returnValue(throwError('Error'));

    component.saveDraft();

    expect(postService.createPostAsDraft).toHaveBeenCalledWith('Draft Title', 'Draft Content');
  });
  //thought this would increase coverage but it did not :(
  it('should display required error message for title when touched and empty', () => {
    const titleControl = component.postForm.get('title');
    titleControl?.markAsTouched();
    titleControl?.setValue('');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('mat-error');
    expect(errorMessage.textContent).toContain('Title is required');
  });

  it('should display minlength error message for title when touched and too short', () => {
    const titleControl = component.postForm.get('title');
    titleControl?.markAsTouched();
    titleControl?.setValue('a');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('mat-error');
    expect(errorMessage.textContent).toContain('Title is too short');
  });

  it('should display maxlength error message for title when touched and too long', () => {
    const titleControl = component.postForm.get('title');
    titleControl?.markAsTouched();
    titleControl?.setValue('a'.repeat(101));
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('mat-error');
    expect(errorMessage.textContent).toContain('Title is too long');
  });

  it('should display required error message for content when touched and empty', () => {
    const contentControl = component.postForm.get('content');
    contentControl?.markAsTouched();
    contentControl?.setValue('');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('mat-error');
    expect(errorMessage.textContent).toContain('Content is required');
  });

  it('should display minlength error message for content when touched and too short', () => {
    const contentControl = component.postForm.get('content');
    contentControl?.markAsTouched();
    contentControl?.setValue('a');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('mat-error');
    expect(errorMessage.textContent).toContain('Content is too short');
  });
});
