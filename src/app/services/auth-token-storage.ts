import { inject, Injectable } from '@angular/core';
import { LocalStorageToken } from '../tokens/local-storage';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenStorage {
  private readonly key: string = "auth-token";

  LocalStorageToken = inject(localStorageToken);

  set(Token: string) {
    this.LocalStorageToken.setItem(this.key, token);
  }
}
