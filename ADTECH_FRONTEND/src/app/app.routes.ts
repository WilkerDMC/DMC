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
    path: 'cadastro',
    loadComponent: () => import('./login/cadastro/cadastro').then(m => m.Cadastro)
  },
  {
    path: 'home-cartorio',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home').then(m => m.Home)
  },
  {
    path: 'home-advogado',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home').then(m => m.Home)
  },
  {
    path: 'home-cliente',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home').then(m => m.Home)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/clientes/clientes').then(m => m.Clientes)
  },
  {
    path: 'documentos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/documentos/documentos').then(m => m.Documentos)
  },
  {
    path: 'processos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/processos/processos').then(m => m.Processos)
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/calendar/calendar').then(m => m.Calendar)
  },
  {
    path: 'due-diligence',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/due-diligence/due-diligence').then(m => m.DueDiligence)
  },
  {
    path: 'procuracao',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/procuracao/procuracao').then(m => m.ProcuracaoDigital)
  }
];
