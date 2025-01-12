import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostComponent } from './post.component';
import { DatePipe } from '@angular/common';
import { Post } from '../../../models/post.model';

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostComponent, DatePipe] 
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    component.post = { id: 1, title: 'Test Post', content: 'This is a test post', createdAt: new Date() } as Post;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //NOW THEY JUST LAUGHING AT ME
  it('should display the author if post.author is defined', () => {
    component.post.author = 'John Doe';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.text-sm').textContent).toContain('John Doe');
  });

  it('should not display the author if post.author is undefined', () => {
    component.post.author = undefined;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.text-sm').textContent).not.toContain('John Doe');
  });

  it('should display the createdAt date if post.createdAt is defined', () => {
    component.post.createdAt = new Date('2023-10-10T10:00:00');
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.text-sm').textContent).toContain('10/10/2023 10:00');
  });

  it('should not display the createdAt date if post.createdAt is undefined', () => {
    component.post.createdAt = undefined;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.text-sm').textContent).not.toContain('10/10/2023 10:00');
  });
});
