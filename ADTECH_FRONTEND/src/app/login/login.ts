import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutorizacaoService } from '../services/autorizacao';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss', '../../styles.scss']
})
export class Login implements OnInit {
  selectedRole: 'cartorio' | 'advogado' | 'cliente' = 'cliente';

  cartorioForm = {
    numero: '',
    email: '',
    password: ''
  };

  advogadoForm = {
    oabNumber: '',
    email: '',
    password: ''
  };

  clienteForm = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private autorizacaoService: AutorizacaoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🔵 Login component ngOnInit chamado');
    // Só executa no browser, não no servidor (SSR)
    if (isPlatformBrowser(this.platformId)) {
      console.log('✅ Login component initialized no browser');
      // Aguarda um pouco para garantir que o componente foi renderizado
      setTimeout(() => {
        const estaAutenticado = this.autorizacaoService.estaAutenticado();
        console.log('🔍 Verificando autenticação:', estaAutenticado);
        if (estaAutenticado) {
          console.log('🔄 Usuário já autenticado, redirecionando...');
          this.redirecionarParaDashboard();
        } else {
          console.log('👤 Usuário não autenticado, mostrando formulário de login');
        }
      }, 200);
    } else {
      console.log('⚠️ Não está no browser (SSR)');
    }
  }

  obterDescricaoLogin(): string {
    return this.autorizacaoService.obterLoginStatus()
      ? "Estou autorizado"
      : "Não estou Autorizado";
  }

  selectRole(role: 'cartorio' | 'advogado' | 'cliente'): void {
    this.selectedRole = role;
    this.errorMessage = '';
    this.fieldErrors = {};
    console.log('Role selecionado:', this.selectedRole);
  }

  hasError(field: string): boolean {
    return !!this.fieldErrors[field];
  }

  getError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  validateCartorioForm(): boolean {
    this.fieldErrors = {};

    if (!this.cartorioForm.numero?.trim()) {
      this.fieldErrors['numero'] = 'Campo obrigatório';
    }

    if (!this.cartorioForm.email?.trim()) {
      this.fieldErrors['email'] = 'Campo obrigatório';
    } else if (!this.isValidEmail(this.cartorioForm.email)) {
      this.fieldErrors['email'] = 'E-mail inválido';
    }

    if (!this.cartorioForm.password?.trim()) {
      this.fieldErrors['password'] = 'Campo obrigatório';
    } else if (this.cartorioForm.password.length < 6) {
      this.fieldErrors['password'] = 'Senha deve ter no mínimo 6 caracteres';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  validateAdvogadoForm(): boolean {
    this.fieldErrors = {};

    if (!this.advogadoForm.oabNumber?.trim()) {
      this.fieldErrors['oabNumber'] = 'Campo obrigatório';
    }

    if (!this.advogadoForm.email?.trim()) {
      this.fieldErrors['email'] = 'Campo obrigatório';
    } else if (!this.isValidEmail(this.advogadoForm.email)) {
      this.fieldErrors['email'] = 'E-mail inválido';
    }

    if (!this.advogadoForm.password?.trim()) {
      this.fieldErrors['password'] = 'Campo obrigatório';
    } else if (this.advogadoForm.password.length < 6) {
      this.fieldErrors['password'] = 'Senha deve ter no mínimo 6 caracteres';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  validateClienteForm(): boolean {
    this.fieldErrors = {};

    if (!this.clienteForm.email?.trim()) {
      this.fieldErrors['email'] = 'Campo obrigatório';
    } else if (!this.isValidEmail(this.clienteForm.email)) {
      this.fieldErrors['email'] = 'E-mail inválido';
    }

    if (!this.clienteForm.password?.trim()) {
      this.fieldErrors['password'] = 'Campo obrigatório';
    } else if (this.clienteForm.password.length < 6) {
      this.fieldErrors['password'] = 'Senha deve ter no mínimo 6 caracteres';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isRoleActive(role: 'cartorio' | 'advogado' | 'cliente'): boolean {
    return this.selectedRole === role;
  }

  onSubmitCartorio(event: Event): void {
    event.preventDefault();
    console.log('Formulário de Cartório enviado:', this.cartorioForm);

    if (!this.validateCartorioForm()) {
      this.errorMessage = 'Por favor, corrija os erros nos campos destacados.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.fieldErrors = {};

    this.authService.login('cartorio', {
      numero: this.cartorioForm.numero,
      email: this.cartorioForm.email,
      password: this.cartorioForm.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Salva a autenticação
          this.autorizacaoService.autorizar('cartorio');
          console.log('✅ Autenticação salva para cartório');

          // Verifica se foi salvo corretamente
          const verificarAuth = () => {
            const estaAutenticado = this.autorizacaoService.estaAutenticado();
            console.log('🔍 Status autenticado após salvar:', estaAutenticado);

            if (estaAutenticado) {
              console.log('🚀 Redirecionando para dashboard...');
              this.router.navigate(['/dashboard']).then(
                (success) => {
                  console.log('✅ Redirecionamento bem-sucedido!');
                },
                (err) => {
                  console.error('❌ Erro ao redirecionar:', err);
                  // Tenta novamente após um delay maior
                  setTimeout(() => {
                    console.log('🔄 Tentando redirecionar novamente...');
                    this.router.navigate(['/dashboard']);
                  }, 500);
                }
              );
            } else {
              console.warn('⚠️ Autenticação não foi salva, tentando novamente...');
              setTimeout(verificarAuth, 100);
            }
          };

          // Aguarda um pouco e verifica
          setTimeout(verificarAuth, 100);
        } else {
          this.errorMessage = response.message || 'Erro ao realizar login. Tente novamente.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.';
        console.error('Erro no login:', error);
      }
    });
  }

  onSubmitAdvogado(event: Event): void {
    event.preventDefault();
    console.log('Submit Advogado:', this.advogadoForm);

    if (!this.validateAdvogadoForm()) {
      this.errorMessage = 'Por favor, corrija os erros nos campos destacados.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.fieldErrors = {};

    this.authService.login('advogado', {
      oabNumber: this.advogadoForm.oabNumber,
      email: this.advogadoForm.email,
      password: this.advogadoForm.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Salva a autenticação
          this.autorizacaoService.autorizar('advogado');
          console.log('✅ Autenticação salva para advogado');

          // Verifica se foi salvo corretamente
          const verificarAuth = () => {
            const estaAutenticado = this.autorizacaoService.estaAutenticado();
            console.log('🔍 Status autenticado após salvar:', estaAutenticado);

            if (estaAutenticado) {
              console.log('🚀 Redirecionando para dashboard...');
              this.router.navigate(['/dashboard']).then(
                (success) => {
                  console.log('✅ Redirecionamento bem-sucedido!');
                },
                (err) => {
                  console.error('❌ Erro ao redirecionar:', err);
                  // Tenta novamente após um delay maior
                  setTimeout(() => {
                    console.log('🔄 Tentando redirecionar novamente...');
                    this.router.navigate(['/dashboard']);
                  }, 500);
                }
              );
            } else {
              console.warn('⚠️ Autenticação não foi salva, tentando novamente...');
              setTimeout(verificarAuth, 100);
            }
          };

          // Aguarda um pouco e verifica
          setTimeout(verificarAuth, 100);
        } else {
          this.errorMessage = response.message || 'Erro ao realizar login. Tente novamente.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.';
        console.error('Erro no login:', error);
      }
    });
  }

  onSubmitCliente(event: Event): void {
    event.preventDefault();
    console.log('Submit Cliente:', this.clienteForm);

    if (!this.validateClienteForm()) {
      this.errorMessage = 'Por favor, corrija os erros nos campos destacados.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.fieldErrors = {};

    this.authService.login('cliente', {
      email: this.clienteForm.email,
      password: this.clienteForm.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Salva a autenticação
          this.autorizacaoService.autorizar('cliente');
          console.log('✅ Autenticação salva para cliente');

          // Verifica se foi salvo corretamente
          const verificarAuth = () => {
            const estaAutenticado = this.autorizacaoService.estaAutenticado();
            console.log('🔍 Status autenticado após salvar:', estaAutenticado);

            if (estaAutenticado) {
              console.log('🚀 Redirecionando para dashboard...');
              this.router.navigate(['/dashboard']).then(
                (success) => {
                  console.log('✅ Redirecionamento bem-sucedido!');
                },
                (err) => {
                  console.error('❌ Erro ao redirecionar:', err);
                  // Tenta novamente após um delay maior
                  setTimeout(() => {
                    console.log('🔄 Tentando redirecionar novamente...');
                    this.router.navigate(['/dashboard']);
                  }, 500);
                }
              );
            } else {
              console.warn('⚠️ Autenticação não foi salva, tentando novamente...');
              setTimeout(verificarAuth, 100);
            }
          };

          // Aguarda um pouco e verifica
          setTimeout(verificarAuth, 100);
        } else {
          this.errorMessage = response.message || 'Erro ao realizar login. Tente novamente.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.';
        console.error('Erro no login:', error);
      }
    });
  }

  private redirecionarParaDashboard(): void {
    console.log('🔄 Redirecionando para dashboard');
    this.router.navigate(['/dashboard']);
  }

  clearForms(): void {
    this.cartorioForm = { numero: '', email: '', password: '' };
    this.advogadoForm = { oabNumber: '', email: '', password: '' };
    this.clienteForm = { email: '', password: '' };
    this.errorMessage = '';
  }

  irParaCadastro(): void {
    console.log('🚀 Navegando para cadastro...');
    this.router.navigate(['/cadastro']).then(success => {
      console.log('✅ Navegação bem-sucedida:', success);
    }).catch(error => {
      console.error('❌ Erro na navegação:', error);
    });
  }
}
