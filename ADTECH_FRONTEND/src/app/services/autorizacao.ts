import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AutorizacaoService {
  private readonly LOGIN_KEY = 'login';
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {}

  private getLocalStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) {
      return window.localStorage;
    }
    return null;
  }

  autorizar(role?: string): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.setItem(this.LOGIN_KEY, 'sim');
      if (role) {
        storage.setItem('userRole', role);
      }
    }
  }

  deslogar(): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem(this.LOGIN_KEY);
      storage.removeItem('userRole');
    }
  }

  obterLoginStatus(): boolean {
    const storage = this.getLocalStorage();
    if (!storage) {
      return false;
    }
    return !!storage.getItem(this.LOGIN_KEY);
  }

  obterRole(): string | null {
    const storage = this.getLocalStorage();
    if (!storage) {
      return null;
    }
    return storage.getItem('userRole');
  }

  estaAutenticado(): boolean {
    return this.obterLoginStatus();
  }
}
