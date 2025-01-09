import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  public notificationService = inject(NotificationService);
  public matSnackBar = inject(MatSnackBar);
  notifications: Notification[] = [];
  private notificationSubscription!: Subscription;

  ngOnInit() {
    if (this.isEditor) {
      this.notificationSubscription = this.notificationService.pollNotifications().subscribe(notifications => {
        this.notifications = notifications;
      });
    }
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  
  get hasUnreadNotifications(): boolean {
    return this.notifications.length > 0;
  }

  readAllNotifications(): void {
    this.notificationService.readAll().pipe(
      tap(() => {
        this.notifications = [];
      }),
      catchError(error => {
        this.matSnackBar.open('Error marking notifications as read' + error, 'Close', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe();
  }
  get isUser(): boolean {
    return this.authService.isLoggedIn();
  }
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
