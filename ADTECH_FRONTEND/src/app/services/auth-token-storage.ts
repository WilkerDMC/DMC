import { inject, Injectable } from '@angular/core';
import { LocalStorageToken } from '../tokens/local-storage';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenStorage {
  private readonly key: string = "auth-token";

  private localStorage = inject(LocalStorageToken);

  set(token: string) {
    this.localStorage.setItem(this.key, token);
  }
}
