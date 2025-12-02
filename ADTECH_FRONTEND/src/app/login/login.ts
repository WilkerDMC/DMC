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
    console.log('Role selecionado:', this.selectedRole);
  }

  isRoleActive(role: 'cartorio' | 'advogado' | 'cliente'): boolean {
    return this.selectedRole === role;
  }

  onSubmitCartorio(event: Event): void {
    event.preventDefault();
    console.log('Formulário de Cartório enviado:', this.cartorioForm);

    if (!this.cartorioForm.numero || !this.cartorioForm.email || !this.cartorioForm.password) {
      this.errorMessage = 'Por favor, preencha todos os campos do formulário de Cartório.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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
              console.log('🚀 Redirecionando para home-cartorio...');
              this.router.navigate(['/home-cartorio']).then(
                (success) => {
                  console.log('✅ Redirecionamento bem-sucedido!');
                },
                (err) => {
                  console.error('❌ Erro ao redirecionar:', err);
                  // Tenta novamente após um delay maior
                  setTimeout(() => {
                    console.log('🔄 Tentando redirecionar novamente...');
                    this.router.navigate(['/home-cartorio']);
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

    if (!this.advogadoForm.oabNumber || !this.advogadoForm.email || !this.advogadoForm.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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
              console.log('🚀 Redirecionando para home-advogado...');
              this.router.navigate(['/home-advogado']).then(
                (success) => {
                  console.log('✅ Redirecionamento bem-sucedido!');
                },
                (err) => {
                  console.error('❌ Erro ao redirecionar:', err);
                  // Tenta novamente após um delay maior
                  setTimeout(() => {
                    console.log('🔄 Tentando redirecionar novamente...');
                    this.router.navigate(['/home-advogado']);
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

    if (!this.clienteForm.email || !this.clienteForm.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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
              console.log('🚀 Redirecionando para home-cliente...');
              this.router.navigate(['/home-cliente']).then(
                (success) => {
                  console.log('✅ Redirecionamento bem-sucedido!');
                },
                (err) => {
                  console.error('❌ Erro ao redirecionar:', err);
                  // Tenta novamente após um delay maior
                  setTimeout(() => {
                    console.log('🔄 Tentando redirecionar novamente...');
                    this.router.navigate(['/home-cliente']);
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
    const role = this.autorizacaoService.obterRole();
    switch(role) {
      case 'cartorio':
        this.router.navigate(['/home-cartorio']);
        break;
      case 'advogado':
        this.router.navigate(['/home-advogado']);
        break;
      case 'cliente':
        this.router.navigate(['/home-cliente']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  clearForms(): void {
    this.cartorioForm = { numero: '', email: '', password: '' };
    this.advogadoForm = { oabNumber: '', email: '', password: '' };
    this.clienteForm = { email: '', password: '' };
    this.errorMessage = '';
  }
}
