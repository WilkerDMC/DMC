// Importa os módulos necessários do Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Decorador que define as configurações e rotas do componente
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['../../styles.scss']
})

// Classe do componente que implementa a interface OnInit
export class Login implements OnInit {
  // Controla qual formulário está visível
  selectedRole: 'cartorio' | 'advogado' | 'cliente' = 'cliente';

  // Dados dos formulários
  // cartorio form
  cartorioForm = {
    numero: '',
    email: '',
    password: ''
  };

  // advogado form
  advogadoForm = {
    oabNumber: '',
    email: '',
    password: ''
  };

  // cliente form
  clienteForm = {
    email: '',
    password: ''
  };

  // Controle de loading e erros
  isLoading = false;
  errorMessage = '';

  // Injeção de dependência do roteador
  constructor(private router: Router) {}

  // Método chamado na inicialização do componente
  ngOnInit(): void {
    console.log('Login component initialized');
    console.log('Role inicial:', this.selectedRole);
  }

  /** Seleciona qual o perfil (role) está ativo */
  selectRole(role: 'cartorio' | 'advogado' | 'cliente'): void {
    this.selectedRole = role;
    this.errorMessage = ''; // Limpa mensagens de erro ao mudar de perfil
    console.log('Role selecionado:', this.selectedRole);
  }

  /** Verifica se um role específico está ativo */
  isRoleActive(role: 'cartorio' | 'advogado' | 'cliente'): boolean {
    return this.selectedRole === role;
  }

  /** Submit do formulário de cartório */
  onSubmitCartorio(event: Event): void {
    event.preventDefault();
    console.log('Formulário de Cartório enviado:', this.cartorioForm);

    // Simula um processo de login do cartório
    if (!this.cartorioForm.numero || !this.cartorioForm.email || !this.cartorioForm.password) {
      this.errorMessage = 'Por favor, preencha todos os campos do formulário de Cartório.';
      return;
    }

    this.isLoading = true;

    // Simula a chamada da API
    setTimeout(() => {
      this.isLoading = false;
      alert('Login do Cartório bem-sucedido!');
      console.log('Dados:', this.cartorioForm);
      this.router.navigate(['/dashboard-cartorio']);
    }, 1000);
  }

  /** Submit do formulário do advogado */
  onSubmitAdvogado(event: Event): void {
    event.preventDefault();

    console.log('Submit Advogado:', this.advogadoForm);

    if (!this.advogadoForm.oabNumber || !this.advogadoForm.email || !this.advogadoForm.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.isLoading = true;

    // Simula a chamada da API
    setTimeout(() => {
      this.isLoading = false;
      alert('Login do Advogado bem-sucedido!');
      console.log('Dados:', this.advogadoForm);
      this.router.navigate(['/dashboard-advogado']);
    }, 1000);
  }

  /** Submit do formulário do cliente */
  onSubmitCliente(event: Event): void {
    event.preventDefault();

    console.log('Submit Cliente:', this.clienteForm);

    if (!this.clienteForm.email || !this.clienteForm.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.isLoading = true;

    // Simula a chamada da API
    setTimeout(() => {
      this.isLoading = false;
      alert('Login do Cliente bem-sucedido!');
      console.log('Dados:', this.clienteForm);
      this.router.navigate(['/dashboard-cliente']);
    }, 1000);
  }

  /** Limpa os formulários */
  clearForms(): void {
    this.cartorioForm = { numero: '', email: '', password: '' };
    this.advogadoForm = { oabNumber: '', email: '', password: '' };
    this.clienteForm = { email: '', password: '' };
    this.errorMessage = '';
  }
}
