import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AuthenticatedUser } from 'src/app/core/models/auth-user.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnChanges {
  @Input() user!: AuthenticatedUser;

  // Admin-specific data
  totalUsers = 0;
  systemHealth = 'Good';
  recentActivities: any[] = [];

  ngOnInit(): void {
    // Don't call loadAdminData here
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.loadAdminData();
    }
  }

  private loadAdminData(): void {
    if (this.user?.firstName) {
      console.log('Loading admin dashboard for:', this.user.firstName);
      // Load admin-specific dashboard data
    }
  }
}