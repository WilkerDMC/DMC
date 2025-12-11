import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ClienteForm {
  cnpj?: string;
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
  tipo: 'fisica' | 'juridica' | 'advogado' | 'colaborador';
  cpfCnpj: string;
  nome: string;
  telefoneCelular: string;
  genero?: 'masculino' | 'feminino' | 'outros' | 'prefiro-nao-identificar';
  maiorIdade: boolean;
  rg?: string;
  profissao?: string;
  dataNascimento?: string;
  naturalidade?: string;
  estadoCivil?: string;
  nomeMae?: string;
  nomePai?: string;
  categoria: string;
  oab?: string;
  // Arquivos/Documentos
  foto?: File;
  documentoIdentidade?: File;
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
    nome: '',
    telefoneCelular: '',
    genero: 'masculino',
    maiorIdade: false,
    rg: '',
    profissao: '',
    dataNascimento: '',
    naturalidade: '',
    estadoCivil: '',
    nomeMae: '',
    nomePai: '',
  categoria: '',
    cnpj: '',
    inscricaoEstadual: '',
    razaoSocial: '',
    nomeFantasia: '',
    dataAbertura: '',
    porte: '',
    naturezaJuridica: '',
    opcaoMei: '',
    opcaoSimples: '',
    dataOpcaoSimples: '',
    capitalSocial: '',
    tipoMatriz: '',
    situacao: '',
    dataSituacaoCadastral: '',
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {};

  // Previews dos arquivos
  fotoPreview: string | null = null;
  documentoIdentidadePreview: string | null = null;
  comprovanteEnderecoPreview: string | null = null;
  cnhPreview: string | null = null;
  certidaoNascimentoPreview: string | null = null;
  tituloEleitorPreview: string | null = null;
  carteiraTrabalhoPreview: string | null = null;

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
      this.fieldErrors['cpfCnpj'] = 'CPF é obrigatório';
      isValid = false;
    }

    // Validação do CNPJ para pessoa jurídica
    if (this.clienteForm.tipo === 'juridica' && !this.clienteForm.cpfCnpj) {
      this.fieldErrors['cpfCnpj'] = 'CNPJ é obrigatório';
      isValid = false;
    }

    // Validação do telefone celular
    if (!this.clienteForm.telefoneCelular || this.clienteForm.telefoneCelular.trim() === '') {
      this.fieldErrors['telefoneCelular'] = 'Telefone celular é obrigatório';
      isValid = false;
    }

    // Validação de maior de idade
    if (this.clienteForm.tipo === 'fisica' && !this.clienteForm.maiorIdade) {
      this.fieldErrors['maiorIdade'] = 'É necessário ser maior de 18 anos';
      isValid = false;
    }

    return isValid;
  }

  onDocumentSelected(event: Event, documentType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Atribui o arquivo ao campo correto
      switch(documentType) {
        case 'documentoIdentidade':
          this.clienteForm.documentoIdentidade = file;
          this.createPreview(file, 'documentoIdentidade');
          break;
        case 'comprovanteEndereco':
          this.clienteForm.comprovanteEndereco = file;
          this.createPreview(file, 'comprovanteEndereco');
          break;
        case 'cnh':
          this.clienteForm.cnh = file;
          this.createPreview(file, 'cnh');
          break;
        case 'certidaoNascimento':
          this.clienteForm.certidaoNascimento = file;
          this.createPreview(file, 'certidaoNascimento');
          break;
        case 'tituloEleitor':
          this.clienteForm.tituloEleitor = file;
          this.createPreview(file, 'tituloEleitor');
          break;
        case 'carteiraTrabalho':
          this.clienteForm.carteiraTrabalho = file;
          this.createPreview(file, 'carteiraTrabalho');
          break;
      }
    }
  }

  createPreview(file: File, documentType: string): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const preview = e.target?.result as string;
      switch(documentType) {
        case 'documentoIdentidade':
          this.documentoIdentidadePreview = preview;
          break;
        case 'comprovanteEndereco':
          this.comprovanteEnderecoPreview = preview;
          break;
        case 'cnh':
          this.cnhPreview = preview;
          break;
        case 'certidaoNascimento':
          this.certidaoNascimentoPreview = preview;
          break;
        case 'tituloEleitor':
          this.tituloEleitorPreview = preview;
          break;
        case 'carteiraTrabalho':
          this.carteiraTrabalhoPreview = preview;
          break;
      }
    };
    reader.readAsDataURL(file);
  }

  removeDocument(documentType: string): void {
    switch(documentType) {
      case 'foto':
        this.clienteForm.foto = undefined;
        this.fotoPreview = null;
        break;
      case 'documentoIdentidade':
        this.clienteForm.documentoIdentidade = undefined;
        this.documentoIdentidadePreview = null;
        break;
      case 'comprovanteEndereco':
        this.clienteForm.comprovanteEndereco = undefined;
        this.comprovanteEnderecoPreview = null;
        break;
      case 'cnh':
        this.clienteForm.cnh = undefined;
        this.cnhPreview = null;
        break;
      case 'certidaoNascimento':
        this.clienteForm.certidaoNascimento = undefined;
        this.certidaoNascimentoPreview = null;
        break;
      case 'tituloEleitor':
        this.clienteForm.tituloEleitor = undefined;
        this.tituloEleitorPreview = null;
        break;
      case 'carteiraTrabalho':
        this.clienteForm.carteiraTrabalho = undefined;
        this.carteiraTrabalhoPreview = null;
        break;
    }
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
