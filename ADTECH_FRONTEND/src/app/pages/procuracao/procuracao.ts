import { CommonModule, NgIf, DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-procuracao',
    standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgIf, DatePipe],
    templateUrl: './procuracao.html',
    styleUrls: ['./procuracao.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
export class ProcuracaoComponent implements OnInit {
    step: 1 | 2 | 3 | 4 | 5 = 1;
    procGerada = false;
    expandir = false;
    expandir2 = false;
    dataAtual = new Date();

  // Formulário reativo principal
  procuracaoForm!: FormGroup;

  // Texto base para poderes (pré-preenchido)
  readonly textoPoderesBase = `A outorgante concede ao(s) outorgado(s) todos os poderes necessários para representá-la nas esferas administrativas e jurídicas, com a cláusula ad judicia et extra, para representá-la em todos os atos da vida civil, bem como em quaisquer processos judiciais e administrativos, em qualquer instância ou tribunal, podendo, para tanto: exigir documentos, firmar acordos, solicitar certidões, homologar protocolos, promover diligências em geral, retirar e apresentar documentos, entre outros atos necessários ao fiel cumprimento deste mandato.`;

  // Cláusula de renúncia (readonly)
  readonly clausulaRenuncia = `A outorgante renuncia expressamente ao direito de arguir falsidade, erro ou vício do presente instrumento, bem como ao direito de revogar a presente procuração, salvo mediante expressa manifestação de vontade por escrito, devidamente autenticada.`;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.procuracaoForm = this.fb.group({
      // ETAPA 1 - DADOS DO OUTORGANTE
      grantor: this.fb.group({
        nome: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', [Validators.required, this.cpfValidator]],
        tipoDocumento: ['RG', Validators.required],
        numeroDocumento: ['', Validators.required],
        estadoCivil: ['', Validators.required],
        endereco: ['', Validators.required],
        telefoneCelular: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]]
      }),

      // ETAPA 2 - PODERES DA PROCURAÇÃO
      poderes: this.fb.group({
        tipoProcuração: ['geral', Validators.required],
        poderesConcedidos: [this.textoPoderesBase, Validators.required]
      }),

      // ETAPA 3 - VALIDADE E CONDIÇÕES
      validade: this.fb.group({
        tipoValidade: ['indeterminado', Validators.required],
        dataValidade: [''],
        honorarios: ['']
      })
    });

    // Observar mudanças no tipo de validade para validar data
    this.validadeForm.get('tipoValidade')?.valueChanges.subscribe(tipo => {
      const dataControl = this.validadeForm.get('dataValidade');
      if (tipo === 'data-especifica') {
        dataControl?.setValidators([Validators.required]);
      } else {
        dataControl?.clearValidators();
      }
      dataControl?.updateValueAndValidity();
    });
  }

  // Validador de CPF
  cpfValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    const cpf = control.value.replace(/\D/g, '');
    if (cpf.length !== 11) {
      return { cpfInvalido: true };
    }
    return null;
  }

  // Aplicar máscara de CPF
  applyCpfMask(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      const cpfControl = this.grantorForm.get('cpf');
      if (cpfControl) {
        cpfControl.setValue(value, { emitEvent: false });
      }
    }
  }

  // Aplicar máscara de telefone
  applyTelefoneMask(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length <= 10) {
        // Telefone fixo: (00) 0000-0000
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        // Celular: (00) 00000-0000
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
      }
      const telefoneControl = this.grantorForm.get('telefoneCelular');
      if (telefoneControl) {
        telefoneControl.setValue(value, { emitEvent: false });
      }
    }
  }

  // Navegação entre etapas
  nextStep(): void {
    if (this.isStepValid() && this.step < 5) {
      this.step++;
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
    }

    isStep(n: number): boolean {
      return this.step === n;
    }

    isStepGreaterThan(n: number): boolean {
      return this.step > n;
    }

    isStepCompleted(n: number): boolean {
      return this.step > n;
    }

    isStepValid(): boolean {
    switch (this.step) {
      case 1:
        return this.procuracaoForm.get('grantor')?.valid || false;
      case 2:
        return this.procuracaoForm.get('poderes')?.valid || false;
      case 3:
        return this.procuracaoForm.get('validade')?.valid || false;
      default:
        return true;
    }
  }

  gerarProcuracao(): void {
      if (this.step === 2) {
        this.step = 3;
      } else if (this.step === 3) {
        this.step = 4;
        this.procGerada = true;
      } else if (this.step === 4) {
        this.step = 5;
      }
    }

  // Getters para facilitar acesso aos valores do formulário
  get grantorForm(): FormGroup {
    return this.procuracaoForm.get('grantor') as FormGroup;
  }

  get poderesForm(): FormGroup {
    return this.procuracaoForm.get('poderes') as FormGroup;
  }

  get validadeForm(): FormGroup {
    return this.procuracaoForm.get('validade') as FormGroup;
  }

  // Helpers de validação para o template
  hasError(section: 'grantor' | 'poderes' | 'validade', controlName: string): boolean {
    const group = this.procuracaoForm.get(section) as FormGroup | null;
    const control = group?.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(section: 'grantor' | 'poderes' | 'validade', controlName: string): string {
    const group = this.procuracaoForm.get(section) as FormGroup | null;
    const control = group?.get(controlName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Campo obrigatório.';
    }

    if (control.errors['email']) {
      return 'Informe um e-mail válido.';
    }

    if (controlName === 'cpf' && control.errors['cpfInvalido']) {
      return 'CPF inválido.';
    }

    return 'Valor inválido.';
  }

  // Preview do documento jurídico
  get procuracaoPreview(): string {
    const grantor = this.grantorForm.value;
    const poderes = this.poderesForm.value;
    const validade = this.validadeForm.value;

    if (!grantor.nome || !grantor.cpf) {
      return 'Preencha os dados do outorgante para visualizar o preview.';
    }

    const tipoDoc = grantor.tipoDocumento === 'RG' ? 'RG' : 
                    grantor.tipoDocumento === 'CNH' ? 'CNH' : 'RNE';
    
    const estadoCivilText = this.getEstadoCivilText(grantor.estadoCivil);
    const validadeText = this.getValidadeText(validade);
    const poderesText = poderes.poderesConcedidos || this.textoPoderesBase;

    const dataFormatada = this.dataAtual.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    return `PROCURAÇÃO PÚBLICA


Eu, ${grantor.nome}, ${estadoCivilText}, portador(a) do CPF nº ${grantor.cpf} e ${tipoDoc} nº ${grantor.numeroDocumento}, residente e domiciliado(a) em ${grantor.endereco}, nomeio e constituo como meu(minha) bastante procurador(a) para me representar junto a terceiros, com os poderes especificados abaixo.


PODERES CONCEDIDOS


${poderesText}


${validadeText}


${this.clausulaRenuncia}


Local e data: ${dataFormatada}.


_________________________________________
${grantor.nome}
CPF: ${grantor.cpf}`;
  }

  getEstadoCivilText(estadoCivil: string): string {
    const estados: { [key: string]: string } = {
      'solteiro': 'solteiro(a)',
      'casado': 'casado(a)',
      'divorciado': 'divorciado(a)',
      'viuvo': 'viúvo(a)',
      'uniao-estavel': 'em união estável'
    };
    return estados[estadoCivil] || estadoCivil;
  }

  getValidadeText(validade: any): string {
    if (validade.tipoValidade === 'indeterminado') {
      return 'Esta procuração terá validade indeterminada, permanecendo em vigor até que seja expressamente revogada pela outorgante.';
    } else {
      if (validade.dataValidade) {
        const data = new Date(validade.dataValidade + 'T00:00:00');
        const dataFormatada = data.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        });
        return `Esta procuração terá validade até ${dataFormatada}, salvo revogação antecipada pela outorgante.`;
      }
      return 'Esta procuração terá validade até a data especificada, salvo revogação antecipada pela outorgante.';
    }
  }

  // Métodos de download
  baixarProcuracao(): void {
    const content = this.procuracaoPreview;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `procuração_${this.grantorForm.value.nome.replace(/\s/g, '_')}_${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  baixarDueDiligence(): void {
      alert('Funcionalidade de download de Due Diligence será implementada em breve!');
    console.log('Baixando Due Diligence...', this.procuracaoForm.value);
  }

    onSubmit() {
      // Aqui você pode trocar para preview ou gerar a procuração
      // Exemplo: this.view = 'preview';
      alert('Procuração gerada!');
    }
  }
