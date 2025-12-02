import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

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
  // Credenciais mockadas para demonstração
  // Em produção, isso viria de uma API
  private readonly MOCK_USERS: {
    cartorio: CartorioUser[];
    advogado: AdvogadoUser[];
    cliente: ClienteUser[];
  } = {
    cartorio: [
      { numero: '121475', email: 'cartorio@teste.com', password: '123456' },
      { numero: '123456', email: 'cartorio2@teste.com', password: 'senha123' },
    ],
    advogado: [
      { oabNumber: 'OAB123456', email: 'advogado@teste.com', password: '123456' },
      { oabNumber: 'OAB789012', email: 'advogado2@teste.com', password: 'senha123' },
    ],
    cliente: [
      { email: 'cliente@teste.com', password: '123456' },
      { email: 'cliente2@teste.com', password: 'senha123' },
      { email: 'teste@teste.com', password: 'teste123' },
    ],
  };

  /**
   * Valida as credenciais de logi
   * @param role Tipo de usuário (cartorio, advogado, cliente)
   * @param credentials Credenciais do formulário
   * @returns Observable com a resposta do login
   */
  login(role: 'cartorio' | 'advogado' | 'cliente', credentials: LoginCredentials): Observable<LoginResponse> {
    // Simula uma chamada de API com delay
    return of(this.validateCredentials(role, credentials)).pipe(delay(1000));
  }

  private validateCredentials(role: 'cartorio' | 'advogado' | 'cliente', credentials: LoginCredentials): LoginResponse {
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
        (u) =>
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
        (u) =>
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
        (u) =>
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
}

