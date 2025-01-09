import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when no user is logged in', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should set and get the user correctly', () => {
    service.setUser('Alice', 'head_editor');
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getUserName()).toBe('Alice');
    expect(service.getUserRole()).toBe('head_editor');
  });

  it('should clear the user', () => {
    service.setUser('Alice', 'head_editor');
    service.clearUser();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getUserName()).toBe('');
    expect(service.getUserRole()).toBe('');
  });

  it('should return the list of users', () => {
    const users: User[] = [
      { name: 'Rune', role: 'editor' },
      { name: 'Eva', role: 'editor' },
      { name: 'Alice', role: 'head_editor' },
      { name: 'Bob', role: 'guest' }
    ];
    expect(service.getUsers()).toEqual(users);
  });
});
