import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSelectionComponent } from './user-selection.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UserSelectionComponent', () => {
  let component: UserSelectionComponent;
  let fixture: ComponentFixture<UserSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ UserSelectionComponent, BrowserAnimationsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a default selected user', () => {
    expect(component.selectedUser).toBeDefined();
  });

  it('should change selected user', () => {
    const newUser = { id: 2, name: 'John Doe', role: 'admin' };
    component.selectedUser = newUser;
    component.selectUser();
    expect(component.selectedUser).toEqual(newUser);
  });

});
