import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule) 
  },
  { 
    path: 'login', 
    loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule) 
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'jobs',
    loadChildren: () => import('./modules/jobs/jobs.module').then(m => m.JobsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers',
    loadChildren: () => import('./modules/customer/customer.module').then(m => m.CustomerModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'equipment',
    loadChildren: () => import('./modules/equipment/equipment.module').then(m => m.EquipmentModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-engineers',
    loadChildren: () => import('./modules/my-engineers/my-engineers.module').then(m => m.MyEngineersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sites',
    loadChildren: () => import('./modules/sites/sites.module').then(m => m.SitesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages/dashboard',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  // Wildcard route - keep this last
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
