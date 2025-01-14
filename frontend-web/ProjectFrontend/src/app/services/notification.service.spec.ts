import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';
import { provideHttpClient } from '@angular/common/http';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getUserName', 'getUserRole']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotificationService,
        { provide: AuthService, useValue: spy }
      ]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authServiceSpy.getUserName.and.returnValue('testUser');
    authServiceSpy.getUserRole.and.returnValue('testRole');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get notifications', () => {
    const dummyNotifications: Notification[] = [
      { message: 'Test Notification 1'},
      { message: 'Test Notification 2'}
    ];

    service.getNotifications().subscribe(notifications => {
      expect(notifications.length).toBe(2);
      expect(notifications).toEqual(dummyNotifications);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/notifications`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyNotifications);
  });
/*
  it('should poll notifications', () => {
    const dummyNotifications: Notification[] = [
      { message: 'Test Notification 1' }
    ];

    service.pollNotifications().subscribe(notifications => {
      expect(notifications).toEqual(dummyNotifications);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/notifications`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyNotifications);
  });
*/
});
