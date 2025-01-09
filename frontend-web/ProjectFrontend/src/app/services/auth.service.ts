import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  clearUser() {
    this.selectedUser = null;
  }
  private users: User[] = [
    { name: 'Rune', role: 'editor' },
    { name: 'Eva', role: 'editor' },
    { name: 'Alice', role: 'head_editor' },
    { name: 'Bob', role: 'guest' }
  ];

  private selectedUser: User | null = null;

  isLoggedIn(): boolean {
    return this.selectedUser !== null;
  }

  setUser(name: string, role: string): void {
    this.selectedUser = { name, role };
  }

  getUserName(): string {
    return this.selectedUser ? this.selectedUser.name : '';
  }

  getUserRole(): string {
    return this.selectedUser ? this.selectedUser.role : '';
  }

  getUsers(): User[] {
    return this.users;
  }
}
