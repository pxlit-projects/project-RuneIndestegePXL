import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [MatToolbarModule,  RouterModule, MatIconModule],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

    public authService = inject(AuthService);
  
    get isEditor(): boolean {
      return this.authService.getUserRole() === 'editor';
    }
  
    get isHeadEditor(): boolean {
      return this.authService.getUserRole() === 'head_editor';
    }

    get isGuest(): boolean {
      return this.authService.getUserRole() === 'guest';
    }

    clearUser(): void {
      this.authService.clearUser();
    }
}
