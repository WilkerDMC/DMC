import { Routes } from '@angular/router';
import { authGuard } from './_guard/autorizado-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  {
    path: 'dashboard-cartorio',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'dashboard-advogado',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'dashboard-cliente',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  }
];
