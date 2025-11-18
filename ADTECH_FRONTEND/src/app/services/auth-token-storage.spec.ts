import { TestBed } from '@angular/core/testing';

import { AuthTokenStorage } from './auth-token-storage';

describe('AuthTokenStorage', () => {
  let service: AuthTokenStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthTokenStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
