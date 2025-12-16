import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ViacepService } from './viacep.service';

interface ClienteForm {
  // Dados Básicos
  tipo: 'fisica' | 'juridica' | 'advogado' | 'colaborador';
  cpfCnpj: string;
  nome: string;
  telefoneCelular: string;
  genero?: 'masculino' | 'feminino' | 'outros' | 'prefiro-nao-identificar';
  maiorIdade: boolean;

  // Pessoa Física
  rg?: string;
  profissao?: string;
  dataNascimento?: string;
  naturalidade?: string;
  estadoCivil?: string;
  nomeMae?: string;
  nomePai?: string;

  // Advogado
  categoria?: string;
  oab?: string;

  // Pessoa Jurídica
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

  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;

  // Arquivos/Documentos
  foto?: File;
  documentoRg?: File;
  documentoCpf?: File;
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
  // Estado do acordeão
  documentoAccordionAberto: string | null = null;

  // CEP
  cepCarregando = false;
  cepErro = '';

  // Tipo de documento de identidade selecionado
  documentoIdentidadeSelecionado = 'rg';

  // Formulário
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
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
  };

  // Estados
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {};

  // Previews dos arquivos
  fotoPreview: string | null = null;
  documentoRgPreview: string | null = null;
  documentoCpfPreview: string | null = null;
  comprovanteEnderecoPreview: string | null = null;
  cnhPreview: string | null = null;
  certidaoNascimentoPreview: string | null = null;
  tituloEleitorPreview: string | null = null;
  carteiraTrabalhoPreview: string | null = null;

  constructor(
    private router: Router,
    private viacep: ViacepService
  ) {}

  ngOnInit(): void {
    console.log('🔵 Clientes component iniciado');
  }

  // ============= GETTERS PARA DOCUMENTO DE IDENTIDADE =============
  get documentoIdentidadeFile() {
    if (this.documentoIdentidadeSelecionado === 'cnh') {
      return this.clienteForm.cnh;
    }
    return this.clienteForm.documentoRg;
  }

  get documentoIdentidadeAccept() {
    return 'image/*,.pdf';
  }

  // ============= ACORDEÃO =============
  toggleAccordion(documento: string): void {
    if (this.documentoAccordionAberto === documento) {
      this.documentoAccordionAberto = null;
    } else {
      this.documentoAccordionAberto = documento;
    }
  }

  isAccordionOpen(documento: string): boolean {
    return this.documentoAccordionAberto === documento;
  }

  // ============= BUSCA CEP (API VIACEP) =============
  buscarCep(cepValue?: string): void {
    const cepRaw = (cepValue ?? this.clienteForm.cep ?? '').toString();
    const cep = cepRaw.replace(/\D/g, '');

    this.cepErro = '';

    if (!cep || cep.length !== 8) {
      return;
    }

    this.cepCarregando = true;

    this.viacep.buscar(cep).subscribe({
      next: (res: any) => {
        this.cepCarregando = false;

        if (res && !res.erro) {
          this.clienteForm.logradouro = res.logradouro || '';
          this.clienteForm.bairro = res.bairro || '';
          this.clienteForm.cidade = res.localidade || '';
          this.clienteForm.cep = res.cep || cep;
          this.cepErro = '';
        } else {
          this.limparEndereco();
          this.cepErro = 'CEP não encontrado';
        }
      },
      error: (err) => {
        console.error('Erro ao buscar CEP:', err);
        this.cepCarregando = false;
        this.limparEndereco();
        this.cepErro = 'Erro ao buscar CEP';
      }
    });
  }

  limparEndereco(): void {
    this.clienteForm.logradouro = '';
    this.clienteForm.bairro = '';
    this.clienteForm.cidade = '';
  }

  // ============= SELEÇÃO DE TIPO =============
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

  // ============= UPLOAD DE FOTO =============
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.clienteForm.foto = file;

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

  // ============= DOCUMENTO DE IDENTIDADE (RG OU CNH) =============
  onDocumentoIdentidadeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (this.documentoIdentidadeSelecionado === 'cnh') {
        this.clienteForm.cnh = file;
        this.createPreview(file, 'cnh');
      } else {
        this.clienteForm.documentoRg = file;
        this.createPreview(file, 'documentoRg');
      }
    }
  }

  removeDocumentoIdentidade(): void {
    if (this.documentoIdentidadeSelecionado === 'cnh') {
      this.clienteForm.cnh = undefined;
      this.cnhPreview = null;
    } else {
      this.clienteForm.documentoRg = undefined;
      this.documentoRgPreview = null;
    }
  }

  // ============= UPLOAD DE DOCUMENTOS =============
  onDocumentSelected(event: Event, documentType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      switch(documentType) {
        case 'documentoRg':
          this.clienteForm.documentoRg = file;
          this.createPreview(file, 'documentoRg');
          break;
        case 'documentoCpf':
          this.clienteForm.documentoCpf = file;
          this.createPreview(file, 'documentoCpf');
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
        case 'documentoRg':
          this.documentoRgPreview = preview;
          break;
        case 'documentoCpf':
          this.documentoCpfPreview = preview;
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
      case 'documentoRg':
        this.clienteForm.documentoRg = undefined;
        this.documentoRgPreview = null;
        break;
      case 'documentoCpf':
        this.clienteForm.documentoCpf = undefined;
        this.documentoCpfPreview = null;
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

  // ============= VALIDAÇÃO =============
  hasError(field: string): boolean {
    return !!this.fieldErrors[field];
  }

  getError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  validateForm(): boolean {
    this.fieldErrors = {};
    let isValid = true;

    // Nome obrigatório
    if (!this.clienteForm.nome || this.clienteForm.nome.trim() === '') {
      this.fieldErrors['nome'] = 'Nome é obrigatório';
      isValid = false;
    }

    // CPF/CNPJ obrigatório
    if (!this.clienteForm.cpfCnpj) {
      this.fieldErrors['cpfCnpj'] = this.clienteForm.tipo === 'juridica' ? 'CNPJ é obrigatório' : 'CPF é obrigatório';
      isValid = false;
    }

    // Telefone celular obrigatório
    if (!this.clienteForm.telefoneCelular || this.clienteForm.telefoneCelular.trim() === '') {
      this.fieldErrors['telefoneCelular'] = 'Telefone celular é obrigatório';
      isValid = false;
    }

    // Validação de maior de idade para pessoa física
    if (this.clienteForm.tipo === 'fisica' && !this.clienteForm.maiorIdade) {
      this.fieldErrors['maiorIdade'] = 'É necessário ser maior de 18 anos';
      isValid = false;
    }

    // Documento de identidade obrigatório (RG OU CNH)
    if (!this.clienteForm.documentoRg && !this.clienteForm.cnh) {
      this.fieldErrors['documentoIdentidade'] = 'RG ou CNH é obrigatório';
      isValid = false;
    }

    // CPF obrigatório
    if (!this.clienteForm.documentoCpf) {
      this.fieldErrors['documentoCpf'] = 'CPF é obrigatório';
      isValid = false;
    }

    // Comprovante de endereço obrigatório
    if (!this.clienteForm.comprovanteEndereco) {
      this.fieldErrors['comprovanteEndereco'] = 'Comprovante de endereço é obrigatório';
      isValid = false;
    }

    // Título de eleitor obrigatório
    if (!this.clienteForm.tituloEleitor) {
      this.fieldErrors['tituloEleitor'] = 'Título de eleitor é obrigatório';
      isValid = false;
    }

    // Carteira de trabalho obrigatória
    if (!this.clienteForm.carteiraTrabalho) {
      this.fieldErrors['carteiraTrabalho'] = 'Carteira de trabalho é obrigatória';
      isValid = false;
    }

    return isValid;
  }

  // ============= SUBMIT =============
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
