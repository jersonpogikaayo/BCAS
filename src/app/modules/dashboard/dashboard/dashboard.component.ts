import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { AuthenticatedUser, UserRole } from 'src/app/core/models/auth-user.model';
import { AuthService } from 'src/app/core/services/authentication/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<AuthenticatedUser | null>;
  userRole$: Observable<UserRole | null>;

  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.userRole$ = this.currentUser$.pipe(
      map(user => this.getUserRole(user))
    );
  }

  ngOnInit(): void {
    // No auto-redirect needed - stay on /dashboard
  }

  private getUserRole(user: AuthenticatedUser | null): UserRole | null {
    if (!user?.role) {
      return null;
    }
    
    const roleString = Array.isArray(user.role) ? user.role[0] : user.role;
    
    switch (roleString.toLowerCase()) {
      case 'admin':
        return UserRole.ADMIN;
      case 'manager':
        return UserRole.MANAGER;
      case 'engineer':
        return UserRole.ENGINEER;
      default:
        return null;
    }
  }

  isAdmin(user: AuthenticatedUser | null): boolean {
    return this.hasRole(user, UserRole.ADMIN) || user?.isAdmin === true;
  }

  hasRole(user: AuthenticatedUser | null, role: UserRole): boolean {
    if (!user?.role) {
      return false;
    }
    
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    return userRoles.some((userRole: string) => 
      userRole.toLowerCase() === role.toLowerCase()
    );
  }
}