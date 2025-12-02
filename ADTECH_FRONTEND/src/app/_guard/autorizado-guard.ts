import { inject, PLATFORM_ID } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AutorizacaoService } from '../services/autorizacao';

export const authGuard: CanActivateFn = (route, state) => {
  const autorizacaoService = inject(AutorizacaoService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR), sempre redireciona para login
  if (!isPlatformBrowser(platformId)) {
    console.log('Guard: Não está no browser, bloqueando acesso');
    return false;
  }

  const estaAutenticado = autorizacaoService.estaAutenticado();
  console.log('Guard: Verificando autenticação - está autenticado?', estaAutenticado);
  console.log('Guard: Rota tentada:', state.url);

  if (estaAutenticado) {
    console.log('Guard: Acesso permitido');
    return true;
  }

  console.log('Guard: Acesso negado, redirecionando para login');
  router.navigate(['/login']);
  return false;
};
