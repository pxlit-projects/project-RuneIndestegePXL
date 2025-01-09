import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ 
        NavbarComponent 
      ],
      providers: [
        provideHttpClient(),
        NotificationService,
        AuthService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have unread notifications if there are notifications', () => {
    component.notifications = [{ message: 'Test notification' }];
    expect(component.hasUnreadNotifications).toBeTrue();
  });
/*
  it('should mark all notifications as read', () => {
    spyOn(component.notificationService, 'readAll').and.returnValues(of());
    component.notifications = [{ message: 'Test notification' }];
    component.readAllNotifications();
    expect(component.notifications.length).toBe(0);
  });
*/
  it('should return true if user is logged in', () => {
    spyOn(component.authService, 'isLoggedIn').and.returnValue(true);
    expect(component.isUser).toBeTrue();
  });

  it('should return true if user role is editor', () => {
    spyOn(component.authService, 'getUserRole').and.returnValue('editor');
    expect(component.isEditor).toBeTrue();
  });

  it('should return true if user role is head_editor', () => {
    spyOn(component.authService, 'getUserRole').and.returnValue('head_editor');
    expect(component.isHeadEditor).toBeTrue();
  });

  it('should return true if user role is guest', () => {
    spyOn(component.authService, 'getUserRole').and.returnValue('guest');
    expect(component.isGuest).toBeTrue();
  });

  it('should clear user', () => {
    spyOn(component.authService, 'clearUser');
    component.clearUser();
    expect(component.authService.clearUser).toHaveBeenCalled();
  });
});
