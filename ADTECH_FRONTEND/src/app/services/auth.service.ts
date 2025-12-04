import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {validateCredentials}

export interface LoginCredentials {
  email: string;
  password: string;
  numero?: string; // Para cartório (CNJ)
  oabNumber?: string; // Para advogado (OAB)
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  role?: string;
}

interface CartorioUser {
  numero: string;
  email: string;
  password: string;
}

interface AdvogadoUser {
  oabNumber: string;
  email: string;
  password: string;
}

interface ClienteUser {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}
  login(email: string, password: string):Observable<any> {

    return this.http.post(this.apiUrl, {email, password});
  }
}

  private validateCredentials = (role: 'cartorio' | 'advogado' | 'cliente', credentials: LoginCredentials): LoginResponse {
    // Validação para Cartório
    if (role === 'cartorio') {
      if (!credentials.numero || !credentials.email || !credentials.password) {
        return {
          success: false,
          message: 'Por favor, preencha todos os campos.',
        };
      }

      const users = this.MOCK_USERS.cartorio;
      const user = users.find(
        (u: { numero: string | undefined; email: string; password: string; }) =>
          u.numero === credentials.numero &&
          u.email.toLowerCase() === credentials.email.toLowerCase() &&
          u.password === credentials.password
      );

      if (!user) {
        return {
          success: false,
          message: 'Código CNJ, e-mail ou senha incorretos. Verifique suas credenciais.',
        };
      }

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        role: 'cartorio',
      };
    }

    // Validação para Advogado
    if (role === 'advogado') {
      if (!credentials.oabNumber || !credentials.email || !credentials.password) {
        return {
          success: false,
          message: 'Por favor, preencha todos os campos.',
        };
      }

      const users = this.MOCK_USERS.advogado;
      const user = users.find(
        (u: { oabNumber: string | undefined; email: string; password: string; }) =>
          u.oabNumber === credentials.oabNumber &&
          u.email.toLowerCase() === credentials.email.toLowerCase() &&
          u.password === credentials.password
      );

      if (!user) {
        return {
          success: false,
          message: 'Número OAB, e-mail ou senha incorretos. Verifique suas credenciais.',
        };
      }

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        role: 'advogado',
      };
    }

    // Validação para Cliente
    if (role === 'cliente') {
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          message: 'Por favor, preencha todos os campos.',
        };
      }

      const users = this.MOCK_USERS.cliente;
      const user = users.find(
        (u: { email: string; password: string; }) =>
          u.email.toLowerCase() === credentials.email.toLowerCase() &&
          u.password === credentials.password
      );

      if (!user) {
        return {
          success: false,
          message: 'E-mail ou senha incorretos. Verifique suas credenciais.',
        };
      }

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        role: 'cliente',
      };
    }

    return {
      success: false,
      message: 'Tipo de usuário inválido.',
    };
  }

