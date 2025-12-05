import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface do que enviamos para o Backend
export interface LoginCredentials {
  email: string;
  password: string;
  // Se o seu backend não exigir numero/OAB no login, pode deixar opcional ou remover
  numero?: string;
  oabNumber?: string;
}

// Interface do que recebemos do Backend
export interface LoginResponse {
  access_token: string;
  token_type: string;
  role?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/auth/login';

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    // Envia os dados para o FastAPI e espera a resposta
    return this.http.post<LoginResponse>(this.apiUrl, credentials);
  }

  salvarToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
