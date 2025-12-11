import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ClienteForm {
  tipo: 'fisica' | 'juridica' | 'advogado' | 'colaborador';
  cpfCnpj: string;
  justificativaSemCpf?: string;
  nome: string;
  genero?: 'masculino' | 'feminino' | 'outros' | 'prefiro-nao-identificar';
  rg?: string;
  profissao?: string;
  dataNascimento?: string;
  naturalidade?: string;
  estadoCivil?: string;
  nomeMae?: string;
  nomePai?: string;
  categoria: string;
  urlSite?: string;
  foto?: File;
  inscricaoEstadual?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  dataAbertura?: string;
  porte?: string;
  naturezaJuridica?: string;
  opcaoMei?: string;
  opcaoSimples?: string;
  dataOpcaoSimples?: string;
  capitalSocial?: string;
  tipoMatriz?: string;
  situacao?: string;
  dataSituacaoCadastral?: string;
  telefoneCelular?: string;
  maiorIdade?: boolean;
  oab?: string;
  comprovanteEndereco?: File;
  cnh?: File;
  certidaoNascimento?: File;
  tituloEleitor?: File;
  carteiraTrabalho?: File;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Clientes implements OnInit {
  clienteForm: ClienteForm = {
    tipo: 'fisica',
    cpfCnpj: '',
    justificativaSemCpf: '',
    nome: '',
    genero: 'masculino',
    rg: '',
    profissao: '',
    dataNascimento: '',
    naturalidade: '',
    estadoCivil: '',
    nomeMae: '',
    nomePai: '',
    categoria: '',
    urlSite: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {};
  fotoPreview: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('🔵 Clientes component iniciado');
  }

  selectTipo(tipo: 'fisica' | 'juridica' | 'advogado' | 'colaborador'): void {
    this.clienteForm.tipo = tipo;
    // Limpa campos específicos ao trocar o tipo
    if (tipo === 'juridica') {
      this.clienteForm.genero = undefined;
      this.clienteForm.profissao = undefined;
      this.clienteForm.dataNascimento = undefined;
      this.clienteForm.naturalidade = undefined;
      this.clienteForm.estadoCivil = undefined;
      this.clienteForm.nomeMae = undefined;
      this.clienteForm.nomePai = undefined;
    }
    if (tipo === 'advogado') {
      this.clienteForm.oab = '';
    }
  }
  onDocumentSelected(event: Event, field: keyof ClienteForm): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      (this.clienteForm as any)[field] = input.files[0];
    }
  }

  removeDocument(field: keyof ClienteForm): void {
    (this.clienteForm as any)[field] = undefined;
    if (field === 'foto') {
      this.fotoPreview = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.clienteForm.foto = file;

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.fotoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFoto(): void {
    this.clienteForm.foto = undefined;
    this.fotoPreview = null;
  }

  hasError(field: string): boolean {
    return !!this.fieldErrors[field];
  }

  getError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  validateForm(): boolean {
    this.fieldErrors = {};
    let isValid = true;

    // Validação do nome
    if (!this.clienteForm.nome || this.clienteForm.nome.trim() === '') {
      this.fieldErrors['nome'] = 'Nome é obrigatório';
      isValid = false;
    }

    // Validação do CPF/CNPJ para pessoa física
    if (this.clienteForm.tipo === 'fisica' && !this.clienteForm.cpfCnpj) {
      if (!this.clienteForm.justificativaSemCpf) {
        this.fieldErrors['cpfCnpj'] = 'CPF é obrigatório ou informe a justificativa';
        isValid = false;
      }
    }

    // Validação do CNPJ para pessoa jurídica
    if (this.clienteForm.tipo === 'juridica' && !this.clienteForm.cpfCnpj) {
      this.fieldErrors['cpfCnpj'] = 'CNPJ é obrigatório';
      isValid = false;
    }

    return isValid;
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.isLoading = true;

    try {
      // Aqui você faria a chamada para a API
      console.log('📝 Dados do formulário:', this.clienteForm);

      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.successMessage = 'Cliente cadastrado com sucesso!';

      // Redirecionar após 2 segundos
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro ao cadastrar cliente:', error);
      this.errorMessage = error.message || 'Erro ao cadastrar cliente. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    if (confirm('Deseja realmente cancelar o cadastro? Todos os dados serão perdidos.')) {
      this.router.navigate(['/dashboard']);
    }
  }
}
