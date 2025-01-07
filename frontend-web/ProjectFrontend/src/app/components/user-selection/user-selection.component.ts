import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-user-selection',
  standalone: true,
  templateUrl: './user-selection.component.html',
  imports: [FormsModule, MatFormFieldModule, MatOptionModule, MatSelectModule],
  styleUrls: ['./user-selection.component.css']
})
export class UserSelectionComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.users = this.authService.getUsers();
  }

  selectUser(): void {
    if (this.selectedUser) {
      this.authService.setUser(this.selectedUser.name, this.selectedUser.role);
      this.router.navigate(['/posts']);
    }
  }
}