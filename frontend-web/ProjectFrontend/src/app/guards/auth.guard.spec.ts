import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUserRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', [], {
      url: '/test'
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should redirect to home and return false when user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    const route = new ActivatedRouteSnapshot();
    route.data = { role: 'guest' };

    const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  describe('Guest Role Access', () => {
    beforeEach(() => {
      authService.isLoggedIn.and.returnValue(true);
    });

    it('should allow guest role to access guest pages', () => {
      authService.getUserRole.and.returnValue('guest');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'guest' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeTrue();
    });

    it('should allow editor role to access guest pages', () => {
      authService.getUserRole.and.returnValue('editor');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'guest' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeTrue();
    });

    it('should allow head_editor role to access guest pages', () => {
      authService.getUserRole.and.returnValue('head_editor');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'guest' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeTrue();
    });
  });

  describe('Editor Role Access', () => {
    beforeEach(() => {
      authService.isLoggedIn.and.returnValue(true);
    });

    it('should deny guest role access to editor pages', () => {
      authService.getUserRole.and.returnValue('guest');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'editor' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeFalse();
    });

    it('should allow editor role to access editor pages', () => {
      authService.getUserRole.and.returnValue('editor');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'editor' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeTrue();
    });

    it('should allow head_editor role to access editor pages', () => {
      authService.getUserRole.and.returnValue('head_editor');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'editor' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeTrue();
    });
  });

  describe('Head Editor Role Access', () => {
    beforeEach(() => {
      authService.isLoggedIn.and.returnValue(true);
    });

    it('should deny guest role access to head_editor pages', () => {
      authService.getUserRole.and.returnValue('guest');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'head_editor' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeFalse();
    });

    it('should deny editor role access to head_editor pages', () => {
      authService.getUserRole.and.returnValue('editor');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'head_editor' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeFalse();
    });

    it('should allow head_editor role to access head_editor pages', () => {
      authService.getUserRole.and.returnValue('head_editor');
      const route = new ActivatedRouteSnapshot();
      route.data = { role: 'head_editor' };

      const result = TestBed.runInInjectionContext(() => authGuard(route, mockSnapshot));

      expect(result).toBeTrue();
    });
  });
});

