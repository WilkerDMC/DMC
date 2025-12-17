import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.scss', '../../../styles.scss'],
})
export class Cadastro {
  selectedRole: 'cartorio' | 'advogado' | 'cliente' = 'cliente';
  cadastroForm = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    numero_cartorio: '', // Para cartório
    oabNumber: '', // Para advogado
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(private router: Router, private RegisterService: RegisterService) {}

  selectRole(role: 'cartorio' | 'advogado' | 'cliente'): void {
    this.selectedRole = role;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};
    console.log('Role selecionado:', this.selectedRole);
  }

  hasError(field: string): boolean {
    return !!this.fieldErrors[field];
  }

  getError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  validateForm(): boolean {
    this.fieldErrors = {};

    // Validações comuns
    if (!this.cadastroForm.nome?.trim()) {
      this.fieldErrors['nome'] = 'Campo obrigatório';
    } else if (this.cadastroForm.nome.length < 3) {
      this.fieldErrors['nome'] = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!this.cadastroForm.email?.trim()) {
      this.fieldErrors['email'] = 'Campo obrigatório';
    } else if (!this.isValidEmail(this.cadastroForm.email)) {
      this.fieldErrors['email'] = 'E-mail inválido';
    }

    if (!this.cadastroForm.senha?.trim()) {
      this.fieldErrors['senha'] = 'Campo obrigatório';
    } else if (this.cadastroForm.senha.length < 6) {
      this.fieldErrors['senha'] = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!this.cadastroForm.confirmarSenha?.trim()) {
      this.fieldErrors['confirmarSenha'] = 'Campo obrigatório';
    } else if (this.cadastroForm.senha !== this.cadastroForm.confirmarSenha) {
      this.fieldErrors['confirmarSenha'] = 'As senhas não coincidem';
    }

    // Validações específicas por role
    if (this.selectedRole === 'cartorio' && !this.cadastroForm.numero_cartorio?.trim()) {
      this.fieldErrors['numero_cartorio'] = 'Campo obrigatório';
    }

    if (this.selectedRole === 'advogado' && !this.cadastroForm.oabNumber?.trim()) {
      this.fieldErrors['oabNumber'] = 'Campo obrigatório';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    console.log('Formulário enviado:', this.cadastroForm);

    if (!this.validateForm()) {
      this.errorMessage = 'Por favor, corrija os erros nos campos destacados.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    // Preparar dados para enviar
    const dadosCadastro = {
      nome: this.cadastroForm.nome,
      email: this.cadastroForm.email,
      senha: this.cadastroForm.senha,
      numero_cartorio: this.cadastroForm.numero_cartorio,
      oabNumber: this.cadastroForm.oabNumber
      // numero_cartorio: this.selectedRole === 'cartorio' ? this.cadastroForm.numero_cartorio : undefined;
      // oabNumber: this.selectedRole === 'advogado' ? this.cadastroForm.oabNumber : undefined
    };

    // Inclui o campo específico de acordo com a role
    if (this.selectedRole === 'cartorio') {
      dadosCadastro.numero_cartorio = this.cadastroForm.numero_cartorio;
    }

    if (this.selectedRole === 'advogado') {
      dadosCadastro.oabNumber = this.cadastroForm.oabNumber;
    }

    console.log('📤 Enviando cadastro:', dadosCadastro);

    this.RegisterService.registerOffice(dadosCadastro).subscribe({
      next: (response) => {
        this.isLoading = false;

        console.log('✅ Cadastro bem-sucedido:', response);
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando para login...';

        // Limpar formulário
        this.limparFormulario();

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },

      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
        console.error('❌ Erro no cadastro:', error);
      },
    });
  }

  limparFormulario(): void {
    this.cadastroForm = {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      numero_cartorio: '',
      oabNumber: '',
    };
  }

  voltarParaLogin(): void {
    this.router.navigate(['/login']);
  }
}
