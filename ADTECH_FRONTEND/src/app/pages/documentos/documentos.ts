import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DocumentModel {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  required: RequiredDocument[];
  needsEligibility: boolean;
  legalWarnings?: string[];
  deadlines?: Deadline[];
  estimatedCost?: number;
  processingTime?: string;
  jurisdiction?: string;
}

interface RequiredDocument {
  name: string;
  priority: 'urgente' | 'normal' | 'opcional';
  description: string;
  legalBasis?: string;
  acceptedFormats?: string[];
  mustBeAuthenticated?: boolean;
  expirationDays?: number;
}

interface Deadline {
  title: string;
  days: number;
  description: string;
  isUrgent: boolean;
}

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Documentos implements OnInit, AfterViewInit {
  private uploadedFiles: File[] = [];
  private currentDocument: DocumentModel | null = null;
  private uploadedDocumentsByRequirement: Map<number, File[]> = new Map();

  private DOCUMENT_MODELS: DocumentModel[] = [
    // DOCUMENTO 0: INVENTÁRIO
    {
      id: 'inventario-extrajudicial',
      name: 'Inventário Extrajudicial',
      description: 'Processo de inventário realizado em cartório, sem necessidade de processo judicial.',
      category: 'Inventário',
      icon: 'cube-outline',
      required: [
        {
          name: 'Certidão de óbito do falecido',
          priority: 'urgente',
          description: 'Documento oficial que comprova o falecimento',
          legalBasis: 'Art. 610, §1º do CPC/2015',
          acceptedFormats: ['PDF', 'Imagem escaneada'],
          mustBeAuthenticated: true,
          expirationDays: 0
        },
        {
          name: 'Documentos pessoais de todos os herdeiros (RG, CPF)',
          priority: 'urgente',
          description: 'RG e CPF de todos os herdeiros e cônjuge sobrevivente',
          legalBasis: 'Art. 610, §2º do CPC/2015',
          acceptedFormats: ['PDF', 'JPG', 'PNG'],
          mustBeAuthenticated: false,
          expirationDays: 0
        },
        {
          name: 'Certidão de casamento ou nascimento dos herdeiros',
          priority: 'urgente',
          description: 'Certidões atualizadas (até 90 dias)',
          legalBasis: 'Art. 610 do CPC/2015',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true,
          expirationDays: 90
        },
        {
          name: 'Certidão de casamento do falecido (se aplicável)',
          priority: 'normal',
          description: 'Necessária se o falecido era casado',
          legalBasis: 'Art. 610 do CPC/2015',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true,
          expirationDays: 90
        },
        {
          name: 'Documentos dos bens imóveis (escrituras, matrículas)',
          priority: 'urgente',
          description: 'Escrituras e certidões de matrícula atualizadas do Registro de Imóveis',
          legalBasis: 'Art. 611 do CPC/2015',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true,
          expirationDays: 30
        },
        {
          name: 'Documentos de veículos (CRLVs)',
          priority: 'normal',
          description: 'Certificados de Registro e Licenciamento de Veículos',
          legalBasis: 'Lei 9.503/97 - Código de Trânsito',
          acceptedFormats: ['PDF', 'JPG'],
          mustBeAuthenticated: false,
          expirationDays: 0
        },
        {
          name: 'Extratos bancários e investimentos',
          priority: 'urgente',
          description: 'Extratos de todas as contas e investimentos em nome do falecido',
          legalBasis: 'Art. 611 do CPC/2015',
          acceptedFormats: ['PDF', 'XLS'],
          mustBeAuthenticated: false,
          expirationDays: 30
        },
        {
          name: 'Última declaração de imposto de renda do falecido',
          priority: 'normal',
          description: 'DIRPF do último ano fiscal',
          legalBasis: 'IN RFB 1.171/2011',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false,
          expirationDays: 0
        },
        {
          name: 'Certidões negativas de débitos fiscais',
          priority: 'urgente',
          description: 'Federal, Estadual e Municipal',
          legalBasis: 'Art. 642 do CPC/2015',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true,
          expirationDays: 180
        }
      ],
      needsEligibility: true,
      legalWarnings: [
        '⚠️ Todos os herdeiros devem ser maiores e capazes',
        '⚠️ Deve haver consenso entre todos os herdeiros',
        '⚠️ Não pode haver testamento',
        '⚖️ Necessária presença de advogado (Art. 610, §2º CPC)',
        '💰 ITCMD deve ser recolhido antes da lavratura da escritura'
      ],
      deadlines: [
        { title: 'Abertura do inventário', days: 60, description: 'Prazo para abertura a partir do óbito', isUrgent: true },
        { title: 'Pagamento do ITCMD', days: 180, description: 'Imposto de Transmissão Causa Mortis', isUrgent: true },
        { title: 'Declaração de espólio', days: 90, description: 'Última declaração do falecido na Receita Federal', isUrgent: false }
      ],
      estimatedCost: 8500,
      processingTime: '3 a 6 meses',
      jurisdiction: 'Cartório de Notas'
    },

    // DOCUMENTO 1: PETIÇÃO INICIAL TRABALHISTA
    {
      id: 'peticao-trabalhista',
      name: 'Petição Inicial - Ação Trabalhista',
      description: 'Petição para reclamação trabalhista por verbas rescisórias não pagas.',
      category: 'Petição',
      icon: 'document-text-outline',
      required: [
        {
          name: 'Qualificação completa do reclamante',
          priority: 'urgente',
          description: 'Nome, CPF, RG, endereço completo, profissão',
          legalBasis: 'Art. 840, §1º da CLT',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        },
        {
          name: 'Qualificação da empresa reclamada',
          priority: 'urgente',
          description: 'Razão social, CNPJ, endereço da sede',
          legalBasis: 'Art. 840, §1º da CLT',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'CTPS ou Contrato de Trabalho',
          priority: 'urgente',
          description: 'Carteira de Trabalho com anotações ou contrato assinado',
          legalBasis: 'Art. 11 da CLT',
          acceptedFormats: ['PDF', 'JPG'],
          mustBeAuthenticated: false
        },
        {
          name: 'Holerites dos últimos 12 meses',
          priority: 'normal',
          description: 'Comprovantes de pagamento salarial',
          legalBasis: 'Art. 464 da CLT',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'Termo de Rescisão do Contrato (TRCT)',
          priority: 'normal',
          description: 'Se houver rescisão formalizada',
          legalBasis: 'Art. 477 da CLT',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'Testemunhas (mínimo 2)',
          priority: 'opcional',
          description: 'Nome completo, CPF, profissão, endereço e telefone',
          legalBasis: 'Art. 848 da CLT',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        }
      ],
      needsEligibility: false,
      legalWarnings: [
        '⏰ Prazo prescricional: 2 anos após término do contrato',
        '⚖️ Competência: Justiça do Trabalho',
        '📝 Obrigatória tentativa de conciliação',
        '💰 Isento de custas em 1ª instância (até 2 salários mínimos)'
      ],
      deadlines: [
        { title: 'Prescrição bienal', days: 730, description: 'Prazo para ajuizar ação após fim do contrato', isUrgent: true },
        { title: 'Audiência inicial', days: 30, description: 'Prazo médio para primeira audiência', isUrgent: false }
      ],
      estimatedCost: 0,
      processingTime: '6 a 12 meses',
      jurisdiction: 'Vara do Trabalho'
    },

    // DOCUMENTO 2: CONTESTAÇÃO
    {
      id: 'contestacao-cobranca',
      name: 'Contestação - Ação de Cobrança',
      description: 'Resposta do réu em ação de cobrança indevida.',
      category: 'Defesa',
      icon: 'shield-checkmark-outline',
      required: [
        {
          name: 'Cópia da Petição Inicial',
          priority: 'urgente',
          description: 'Petição inicial recebida com autenticação',
          legalBasis: 'Art. 335 do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true
        },
        {
          name: 'Comprovantes de pagamento',
          priority: 'urgente',
          description: 'Recibos, transferências bancárias ou notas fiscais',
          legalBasis: 'Art. 373, I do CPC',
          acceptedFormats: ['PDF', 'JPG'],
          mustBeAuthenticated: false
        },
        {
          name: 'Contrato ou acordo',
          priority: 'normal',
          description: 'Documento que originou a relação jurídica',
          legalBasis: 'Art. 319, IV do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true
        },
        {
          name: 'Correspondências entre as partes',
          priority: 'opcional',
          description: 'E-mails, WhatsApp, cartas (se houver)',
          legalBasis: 'Art. 369 do CPC',
          acceptedFormats: ['PDF', 'JPG'],
          mustBeAuthenticated: false
        },
        {
          name: 'Perícia ou Laudo Técnico',
          priority: 'opcional',
          description: 'Se necessário comprovar vício ou defeito',
          legalBasis: 'Art. 464 do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true
        }
      ],
      needsEligibility: false,
      legalWarnings: [
        '⏰ Prazo: 15 dias para contestar (Art. 335 CPC)',
        '⚠️ Preclusão: perda do direito se não contestar',
        '📋 Todas as matérias de defesa devem ser alegadas na contestação',
        '⚖️ Documentos novos só com justificativa'
      ],
      deadlines: [
        { title: 'Contestação', days: 15, description: 'Prazo fatal para apresentar defesa', isUrgent: true },
        { title: 'Reconvenção', days: 15, description: 'Prazo concomitante para reconvir', isUrgent: false }
      ],
      estimatedCost: 3500,
      processingTime: '1 a 2 anos',
      jurisdiction: 'Vara Cível'
    },

    // DOCUMENTO 3: RECURSO DE APELAÇÃO
    {
      id: 'recurso-apelacao',
      name: 'Recurso de Apelação',
      description: 'Recurso para reforma de sentença desfavorável em primeira instância.',
      category: 'Recurso',
      icon: 'scale-outline',
      required: [
        {
          name: 'Sentença Completa',
          priority: 'urgente',
          description: 'Cópia integral da sentença com certificação de trânsito',
          legalBasis: 'Art. 1.010 do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true
        },
        {
          name: 'Petição Inicial',
          priority: 'normal',
          description: 'Cópia da peça que deu início ao processo',
          legalBasis: 'Art. 1.010, §1º do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'Contestação',
          priority: 'normal',
          description: 'Peça de defesa apresentada',
          legalBasis: 'Art. 1.010, §1º do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'Provas dos Autos',
          priority: 'urgente',
          description: 'Todas as provas produzidas (documentais, testemunhais, periciais)',
          legalBasis: 'Art. 1.010, §1º do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true
        },
        {
          name: 'Jurisprudências',
          priority: 'normal',
          description: 'Decisões de tribunais superiores sobre tema similar',
          legalBasis: 'Art. 489, §1º, VI do CPC',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        },
        {
          name: 'Comprovante de Preparo',
          priority: 'urgente',
          description: 'Guia de recolhimento das custas recursais (2%)',
          legalBasis: 'Art. 1.007 do CPC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true,
          expirationDays: 5
        }
      ],
      needsEligibility: false,
      legalWarnings: [
        '⏰ Prazo: 15 dias úteis da publicação da sentença',
        '💰 Preparo obrigatório (2% do valor da causa + porte de remessa)',
        '⚠️ Deserção: não pagar preparo = não conhecimento do recurso',
        '📋 Razões devem atacar especificamente os fundamentos da sentença',
        '⚖️ Efeito devolutivo: matéria não recorrida não será analisada'
      ],
      deadlines: [
        { title: 'Interposição', days: 15, description: 'Prazo para protocolar apelação', isUrgent: true },
        { title: 'Preparo', days: 5, description: 'Prazo para recolher custas após interposição', isUrgent: true },
        { title: 'Contrarrazões', days: 15, description: 'Prazo para parte contrária responder', isUrgent: false }
      ],
      estimatedCost: 5000,
      processingTime: '1 a 3 anos',
      jurisdiction: 'Tribunal de Justiça'
    },

    // DOCUMENTO 4: CONTRATO DE PRESTAÇÃO DE SERVIÇOS
    {
      id: 'contrato-prestacao-servicos',
      name: 'Contrato de Prestação de Serviços',
      description: 'Contrato entre prestador de serviços e contratante.',
      category: 'Contratos',
      icon: 'clipboard-outline',
      required: [
        {
          name: 'Qualificação do Contratante',
          priority: 'urgente',
          description: 'Pessoa física (CPF/RG) ou jurídica (CNPJ/Contrato Social)',
          legalBasis: 'Art. 104 do CC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'Qualificação do Prestador',
          priority: 'urgente',
          description: 'Dados completos, inscrição municipal/estadual se aplicável',
          legalBasis: 'Art. 104 do CC',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'Objeto do Contrato',
          priority: 'urgente',
          description: 'Descrição detalhada dos serviços a serem prestados',
          legalBasis: 'Art. 593 do CC',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        },
        {
          name: 'Valor e Forma de Pagamento',
          priority: 'urgente',
          description: 'Preço, parcelas, vencimentos, reajustes',
          legalBasis: 'Art. 597 do CC',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        },
        {
          name: 'Prazo de Vigência',
          priority: 'normal',
          description: 'Data de início e término ou prazo determinado',
          legalBasis: 'Art. 131 do CC',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        },
        {
          name: 'Cláusulas de Rescisão',
          priority: 'normal',
          description: 'Condições para término antecipado, multas',
          legalBasis: 'Art. 473 do CC',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        },
        {
          name: 'Foro de Eleição',
          priority: 'opcional',
          description: 'Comarca escolhida para dirimir conflitos',
          legalBasis: 'Art. 63 do CPC',
          acceptedFormats: ['PDF', 'DOCX'],
          mustBeAuthenticated: false
        }
      ],
      needsEligibility: false,
      legalWarnings: [
        '📝 Contrato deve ser claro e específico',
        '⚖️ Vedada cláusula que desequilibre a relação',
        '💼 Se pessoa jurídica, verificar poderes do signatário',
        '🔍 LGPD: incluir cláusula de proteção de dados se aplicável',
        '📄 Recomendado registro em cartório para maior segurança'
      ],
      estimatedCost: 1500,
      processingTime: '3 a 7 dias',
      jurisdiction: 'Extrajudicial'
    },

    // DOCUMENTO 5: PLANILHA DE HONORÁRIOS
    {
      id: 'planilha-honorarios',
      name: 'Planilha de Honorários Advocatícios',
      description: 'Cálculo detalhado de honorários e custas processuais.',
      category: 'Financeiro',
      icon: 'calculator-outline',
      required: [
        {
          name: 'Dados do Processo',
          priority: 'urgente',
          description: 'Número, vara, comarca, tipo de ação',
          legalBasis: 'Art. 85 do CPC',
          acceptedFormats: ['PDF', 'XLS'],
          mustBeAuthenticated: false
        },
        {
          name: 'Contrato de Honorários',
          priority: 'urgente',
          description: 'Contrato firmado entre advogado e cliente',
          legalBasis: 'Art. 48 do EAOAB',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: true
        },
        {
          name: 'Discriminação de Serviços',
          priority: 'normal',
          description: 'Detalhamento de cada ato praticado',
          legalBasis: 'Art. 85, §2º do CPC',
          acceptedFormats: ['XLS', 'PDF'],
          mustBeAuthenticated: false
        },
        {
          name: 'Horas Trabalhadas',
          priority: 'normal',
          description: 'Registro de tempo dedicado ao processo',
          legalBasis: 'Art. 85, §2º do CPC',
          acceptedFormats: ['XLS'],
          mustBeAuthenticated: false
        },
        {
          name: 'Despesas Processuais',
          priority: 'normal',
          description: 'Custas, taxas, perícias pagas',
          legalBasis: 'Art. 84 do CPC',
          acceptedFormats: ['PDF', 'XLS'],
          mustBeAuthenticated: false
        },
        {
          name: 'Tabela da OAB',
          priority: 'opcional',
          description: 'Valores mínimos sugeridos pela OAB',
          legalBasis: 'Provimento OAB local',
          acceptedFormats: ['PDF'],
          mustBeAuthenticated: false
        }
      ],
      needsEligibility: false,
      legalWarnings: [
        '💰 Honorários devem ser razoáveis e proporcionais',
        '📊 Base de cálculo: valor da causa, complexidade, tempo',
        '⚖️ Honorários sucumbenciais: 10 a 20% (Art. 85, §2º CPC)',
        '📝 Recomendado descritivo detalhado de cada atividade',
        '🔍 Transparência é essencial para aprovação'
      ],
      estimatedCost: 0,
      processingTime: 'Imediato',
      jurisdiction: 'Extrajudicial'
    }
  ];

  ngOnInit() {
    // Inicialização do componente
  }

  ngAfterViewInit() {
    this.setupModal();
    this.setupCategoryButtons();
  }

  private setupCategoryButtons() {
    // Adicionar evento APENAS aos botões de EDITAR dos cards de documentos
    const editBtns = document.querySelectorAll('.btn-edit[data-document]');
    console.log('Botões de editar encontrados:', editBtns.length);

    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const documentId = btn.getAttribute('data-document');
        if (documentId) {
          console.log('Abrindo modal de edição para:', documentId);
          this.openDocumentModal(documentId);
        }
      });
    });
  }

  private openDocumentModal(documentId: string) {
    console.log('openDocumentModal chamado com:', documentId);
    const doc = this.DOCUMENT_MODELS.find(d => d.id === documentId);
    if (!doc) {
      console.error('Documento não encontrado:', documentId);
      return;
    }

    console.log('Documento encontrado:', doc);
    this.currentDocument = doc;
    this.uploadedFiles = [];

    // Atualizar informações do modal
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalIcon = document.querySelector('.modal-icon ion-icon') as any;

    if (modalTitle) modalTitle.textContent = doc.name;
    if (modalDescription) modalDescription.textContent = doc.description;
    if (modalIcon) modalIcon.setAttribute('name', doc.icon);

    // Mostrar/esconder seção de eligibility
    const eligibilitySection = document.getElementById('eligibility-section');
    const uploadArea = document.getElementById('upload-area');

    if (doc.needsEligibility) {
      if (eligibilitySection) eligibilitySection.style.display = 'block';
      if (uploadArea) uploadArea.style.display = 'none';
    } else {
      if (eligibilitySection) eligibilitySection.style.display = 'none';
      if (uploadArea) uploadArea.style.display = 'block';
    }

    // Resetar para primeira aba
    this.switchTab('upload');

    // Preencher requisitos
    this.fillRequirements(doc.required);

    // Preencher alertas legais
    this.fillLegalWarnings(doc.legalWarnings || []);

    // Preencher prazos
    this.fillDeadlines(doc.deadlines || []);

    // Preencher informações adicionais
    this.fillAdditionalInfo(doc);

    // Resetar progresso
    this.resetProgress();

    // Resetar checkboxes
    const checkboxes = document.querySelectorAll('.eligibility-check') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);

    // Resetar status
    const eligibilityStatus = document.getElementById('eligibility-status');
    if (eligibilityStatus) {
      eligibilityStatus.classList.remove('eligible');
      eligibilityStatus.innerHTML = `
        <ion-icon name="alert-circle-outline"></ion-icon>
        <span>⚠️ Marque todos os critérios para continuar</span>
      `;
    }

    // Mostrar modal
    const modal = document.querySelector('.modal-documentos');
    console.log('Modal encontrado:', modal);
    if (modal) {
      (modal as HTMLElement).style.display = 'flex';
      console.log('Modal exibido');
    } else {
      console.error('Modal não encontrado no DOM');
    }
  }

  private setupModal() {
    // Setup de abas
    const tabButtons = document.querySelectorAll('.tab-item');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        this.switchTab(tabName || 'upload');
      });
    });

    // Setup de eligibility checkboxes
    const checkboxes = document.querySelectorAll('.eligibility-check') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.checkEligibility());
    });

    // Setup de upload
    const uploadBox = document.getElementById('upload-box');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;

    uploadBox?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.handleFileUpload(Array.from(target.files));
      }
    });

    // Setup de botões
    const btnCancel = document.getElementById('btn-cancel');
    const btnSubmit = document.getElementById('btn-submit');
    const btnCloseModal = document.querySelector('.btn-close-modal');

    btnCancel?.addEventListener('click', () => this.closeModal());
    btnCloseModal?.addEventListener('click', () => this.closeModal());
    btnSubmit?.addEventListener('click', () => this.submitDocuments());
  }

  private switchTab(tabName: string) {
    // Atualizar botões
    const tabButtons = document.querySelectorAll('.tab-item');
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Atualizar conteúdo
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.classList.remove('active');
    });

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  private checkEligibility() {
    const checkboxes = document.querySelectorAll('.eligibility-check') as NodeListOf<HTMLInputElement>;
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    const eligibilityStatus = document.getElementById('eligibility-status');
    const uploadArea = document.getElementById('upload-area');
    const btnSubmit = document.getElementById('btn-submit') as HTMLButtonElement;

    if (allChecked) {
      eligibilityStatus?.classList.add('eligible');
      if (eligibilityStatus) {
        eligibilityStatus.innerHTML = `
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          <span>✅ Elegível para Inventário Extrajudicial</span>
        `;
      }
      if (uploadArea) uploadArea.style.display = 'block';
      if (btnSubmit) btnSubmit.disabled = false;
    } else {
      eligibilityStatus?.classList.remove('eligible');
      if (eligibilityStatus) {
        eligibilityStatus.innerHTML = `
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>⚠️ Marque todos os critérios para continuar</span>
        `;
      }
      if (uploadArea) uploadArea.style.display = 'none';
      if (btnSubmit) btnSubmit.disabled = true;
    }
  }

  private handleFileUpload(files: File[]) {
    this.uploadedFiles.push(...files);
    this.displayUploadedFiles();
  }

  private displayUploadedFiles() {
    const uploadedFilesDiv = document.getElementById('uploaded-files');
    const filesList = document.getElementById('files-list');
    const fileCount = document.getElementById('file-count');

    if (!filesList || !uploadedFilesDiv || !fileCount) return;

    if (this.uploadedFiles.length > 0) {
      uploadedFilesDiv.style.display = 'block';
      fileCount.textContent = this.uploadedFiles.length.toString();

      filesList.innerHTML = '';
      this.uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
          <ion-icon name="document-outline"></ion-icon>
          <div class="file-info">
            <p class="file-name">${file.name}</p>
            <p class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button class="btn-remove" data-index="${index}">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        `;
        filesList.appendChild(fileItem);

        const btnRemove = fileItem.querySelector('.btn-remove');
        btnRemove?.addEventListener('click', () => this.removeFile(index));
      });
    } else {
      uploadedFilesDiv.style.display = 'none';
    }
  }

  private removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    this.displayUploadedFiles();
  }

  private fillRequirements(requirements: RequiredDocument[]) {
    const reqList = document.getElementById('requirements-list');
    const reqDocName = document.getElementById('req-doc-name');
    const totalReqs = document.getElementById('total-requirements');
    const completedReqs = document.getElementById('completed-requirements');
    const pendingReqs = document.getElementById('pending-requirements');

    if (reqDocName && this.currentDocument) {
      reqDocName.textContent = this.currentDocument.name;
    }

    if (totalReqs) {
      totalReqs.textContent = requirements.length.toString();
    }

    // Contar e exibir documentos urgentes
    const urgentCount = requirements.filter(req => req.priority === 'urgente').length;
    this.updateUrgentBadge(urgentCount);

    if (!reqList) return;

    reqList.innerHTML = '';
    requirements.forEach((req, index) => {
      // Definir classe de prioridade
      const priorityClass = req.priority === 'urgente' ? 'priority-urgent' :
                            req.priority === 'normal' ? 'priority-normal' : 'priority-optional';

      // Ícone de prioridade
      const priorityIcon = req.priority === 'urgente' ? 'alert-circle' :
                          req.priority === 'normal' ? 'information-circle' : 'help-circle';

      // Badge de autenticação
      const authBadge = req.mustBeAuthenticated ?
        '<span class="auth-badge" title="Requer autenticação"><ion-icon name="shield-checkmark"></ion-icon> Autenticado</span>' : '';

      // Badge de validade
      const expiryBadge = req.expirationDays ?
        `<span class="expiry-badge" title="Válido por ${req.expirationDays} dias"><ion-icon name="time"></ion-icon> ${req.expirationDays}d</span>` : '';

      // Emoji de destaque para urgente
      const urgentEmoji = req.priority === 'urgente' ? '🔴 ' : '';

      const item = document.createElement('div');
      item.className = `requirement-item ${priorityClass}`;
      item.innerHTML = `
        <div class="requirement-priority-indicator">
          <ion-icon name="${priorityIcon}"></ion-icon>
        </div>
        <div class="requirement-checkbox-wrapper">
          <input
            type="checkbox"
            class="requirement-checkbox"
            id="req-${index}"
            data-index="${index}"
          />
          <label for="req-${index}" class="requirement-checkbox-label">
            <ion-icon name="checkmark-outline"></ion-icon>
          </label>
        </div>
        <div class="requirement-content">
          <div class="requirement-number">${index + 1}</div>
          <div class="requirement-text-wrapper">
            <div class="requirement-header">
              <p class="requirement-text">${urgentEmoji}${req.name}</p>
              <span class="requirement-priority-badge ${req.priority}">${req.priority === 'urgente' ? '⚠️ ' : ''}${req.priority.toUpperCase()}</span>
            </div>
            <p class="requirement-description">${req.description}</p>
            <div class="requirement-metadata">
              ${req.legalBasis ? `<span class="legal-basis" title="Base Legal"><ion-icon name="book"></ion-icon> ${req.legalBasis}</span>` : ''}
              ${authBadge}
              ${expiryBadge}
            </div>
            <div class="requirement-formats">
              ${req.acceptedFormats ? `<span class="formats-label">Formatos: ${req.acceptedFormats.join(', ')}</span>` : ''}
            </div>
            <span class="requirement-status pending">Pendente</span>
          </div>
        </div>
        <div class="requirement-actions">
          <button class="btn-upload-doc" data-index="${index}" title="Upload deste documento">
            <ion-icon name="cloud-upload-outline"></ion-icon>
          </button>
          <button class="btn-info-doc" data-index="${index}" title="Mais informações">
            <ion-icon name="information-circle-outline"></ion-icon>
          </button>
        </div>
      `;
      reqList.appendChild(item);      // Event listener para checkbox
      const checkbox = item.querySelector('.requirement-checkbox') as HTMLInputElement;
      checkbox?.addEventListener('change', () => {
        this.toggleRequirementStatus(item, checkbox.checked);
        this.updateRequirementsProgress();
      });

      // Event listener para botão de upload
      const btnUpload = item.querySelector('.btn-upload-doc');
      btnUpload?.addEventListener('click', () => {
        this.uploadSpecificDocument(index, req.name, req);
      });

      // Event listener para botão de info
      const btnInfo = item.querySelector('.btn-info-doc');
      btnInfo?.addEventListener('click', () => {
        this.showDocumentInfo(req);
      });
    });

    // Inicializar contadores e seções
    this.updateRequirementsProgress();
    this.updateDocumentsSections();
  }

  private toggleRequirementStatus(item: HTMLElement, checked: boolean) {
    const statusSpan = item.querySelector('.requirement-status') as HTMLElement;

    if (checked) {
      item.classList.add('completed');
      if (statusSpan) {
        statusSpan.textContent = 'Concluído';
        statusSpan.className = 'requirement-status completed';
      }
    } else {
      item.classList.remove('completed');
      if (statusSpan) {
        statusSpan.textContent = 'Pendente';
        statusSpan.className = 'requirement-status pending';
      }
    }
  }

  private updateRequirementsProgress() {
    const checkboxes = document.querySelectorAll('.requirement-checkbox') as NodeListOf<HTMLInputElement>;
    const total = checkboxes.length;
    const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Atualizar estatísticas
    const completedReqs = document.getElementById('completed-requirements');
    const pendingReqs = document.getElementById('pending-requirements');
    const progressFill = document.getElementById('requirements-progress-fill') as HTMLElement;
    const progressText = document.getElementById('requirements-progress-text');

    if (completedReqs) completedReqs.textContent = completed.toString();
    if (pendingReqs) pendingReqs.textContent = pending.toString();
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}% Completo`;

    // Mudar cor da barra conforme progresso
    if (progressFill) {
      progressFill.style.background = percentage === 100
        ? 'linear-gradient(90deg, #10b981, #059669)'
        : percentage >= 50
        ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
        : 'linear-gradient(90deg, #f59e0b, #d97706)';
    }
  }

  private uploadSpecificDocument(index: number, docName: string, req: RequiredDocument) {
    console.log(`Upload do documento: ${docName}`);

    // Criar input file temporário com accept específico
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // Permitir múltiplos arquivos
    const formats = req.acceptedFormats || ['PDF', 'JPG', 'PNG', 'DOC', 'DOCX'];
    input.accept = formats.map(f => `.${f.toLowerCase()}`).join(',');

    input.onchange = (e: any) => {
      const files = Array.from(e.target.files) as File[];
      if (files.length > 0) {
        console.log(`${files.length} arquivo(s) selecionado(s) para ${docName}`);

        // Validar formatos
        const invalidFiles = files.filter(file => {
          const fileExt = file.name.split('.').pop()?.toUpperCase();
          return fileExt && !formats.includes(fileExt);
        });

        if (invalidFiles.length > 0) {
          alert(`⚠️ Formato inválido em ${invalidFiles.length} arquivo(s)!\n\nFormatos aceitos: ${formats.join(', ')}`);
          return;
        }

        // Armazenar arquivos para este requisito
        this.uploadedDocumentsByRequirement.set(index, files);

        // Marcar checkbox automaticamente
        const checkbox = document.getElementById(`req-${index}`) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('change'));
        }

        // Atualizar exibição de documentos enviados e faltantes
        this.updateDocumentsSections();

        // Mostrar mensagem de sucesso
        console.log(`✅ ${files.length} documento(s) enviado(s) para "${docName}"!`);
      }
    };
    input.click();
  }

  private showDocumentInfo(req: RequiredDocument) {
    const infoHtml = `
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ${req.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Descrição:
${req.description}

${req.legalBasis ? `⚖️ Base Legal:\n${req.legalBasis}\n\n` : ''}

📁 Formatos aceitos:
${req.acceptedFormats?.join(', ') || 'Qualquer formato'}

${req.mustBeAuthenticated ? '🛡️ Requer autenticação em cartório\n\n' : ''}

${req.expirationDays ? `⏰ Validade: ${req.expirationDays} dias\n\n` : ''}

🎯 Prioridade: ${req.priority.toUpperCase()}
${req.priority === 'urgente' ? '⚠️ DOCUMENTO OBRIGATÓRIO' : req.priority === 'normal' ? 'ℹ️ Documento importante' : '💡 Documento opcional'}
    `.trim();

    alert(infoHtml);
  }

  private updateDocumentsSections() {
    if (!this.currentDocument) return;

    const uploadedSection = document.getElementById('uploaded-documents-section');
    const uploadedList = document.getElementById('uploaded-documents-list');
    const missingSection = document.getElementById('missing-documents-section');

    // Mostrar seção de documentos enviados se houver algum
    if (this.uploadedDocumentsByRequirement.size > 0) {
      if (uploadedSection) uploadedSection.style.display = 'block';

      if (uploadedList) {
        uploadedList.innerHTML = '';
        this.uploadedDocumentsByRequirement.forEach((files, index) => {
          const req = this.currentDocument?.required[index];
          if (!req) return;

          const item = document.createElement('div');
          item.className = 'uploaded-doc-item';

          const filesHtml = files.map((file, fileIndex) => `
            <div class="uploaded-file">
              <ion-icon name="document"></ion-icon>
              <span class="file-name">${file.name}</span>
              <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
              <button class="btn-remove-file" data-req-index="${index}" data-file-index="${fileIndex}" title="Remover">
                <ion-icon name="close-circle"></ion-icon>
              </button>
            </div>
          `).join('');

          item.innerHTML = `
            <div class="uploaded-doc-header">
              <ion-icon name="checkmark-circle"></ion-icon>
              <span class="doc-name">${req.name}</span>
              <span class="files-count">${files.length} arquivo(s)</span>
            </div>
            <div class="uploaded-files-list">
              ${filesHtml}
            </div>
          `;

          uploadedList.appendChild(item);

          // Adicionar eventos de remover arquivo
          item.querySelectorAll('.btn-remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const target = e.currentTarget as HTMLElement;
              const reqIndex = parseInt(target.getAttribute('data-req-index') || '0');
              const fileIndex = parseInt(target.getAttribute('data-file-index') || '0');
              this.removeUploadedFile(reqIndex, fileIndex);
            });
          });
        });
      }
    } else {
      if (uploadedSection) uploadedSection.style.display = 'none';
    }

    // Atualizar seção de documentos faltantes
    if (missingSection) {
      const hasMissing = this.uploadedDocumentsByRequirement.size < this.currentDocument.required.length;
      missingSection.style.display = hasMissing ? 'block' : 'none';
    }
  }

  private removeUploadedFile(reqIndex: number, fileIndex: number) {
    const files = this.uploadedDocumentsByRequirement.get(reqIndex);
    if (files) {
      files.splice(fileIndex, 1);

      // Se não houver mais arquivos para este requisito, remover entrada e desmarcar checkbox
      if (files.length === 0) {
        this.uploadedDocumentsByRequirement.delete(reqIndex);
        const checkbox = document.getElementById(`req-${reqIndex}`) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = false;
          checkbox.dispatchEvent(new Event('change'));
        }
      }

      this.updateDocumentsSections();
      this.updateRequirementsProgress();
    }
  }

  private updateUrgentBadge(urgentCount: number) {
    const badge = document.getElementById('urgent-count-badge');
    if (!badge) return;

    if (urgentCount > 0) {
      badge.textContent = `${urgentCount} URGENTE${urgentCount > 1 ? 'S' : ''}`;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  private fillLegalWarnings(warnings: string[]) {
    const warningsSection = document.getElementById('legal-warnings-section');
    const warningsList = document.getElementById('warnings-list');

    if (!warnings || warnings.length === 0) {
      if (warningsSection) warningsSection.style.display = 'none';
      return;
    }

    if (warningsSection) warningsSection.style.display = 'block';
    if (!warningsList) return;

    warningsList.innerHTML = '';
    warnings.forEach(warning => {
      const item = document.createElement('div');
      item.className = 'warning-item';

      const iconName = warning.startsWith('⚠️') ? 'warning' :
                        warning.startsWith('⚖️') ? 'scale' :
                        warning.startsWith('💰') ? 'cash' :
                        warning.startsWith('📝') ? 'document-text' :
                        warning.startsWith('🔍') ? 'search' : 'alert-circle';

      item.innerHTML = `
        <ion-icon name="${iconName}-outline"></ion-icon>
        <p>${warning}</p>
      `;
      warningsList.appendChild(item);
    });
  }

  private fillDeadlines(deadlines: Deadline[]) {
    const deadlinesSection = document.getElementById('deadlines-section');
    const deadlinesTimeline = document.getElementById('deadlines-timeline');

    if (!deadlines || deadlines.length === 0) {
      if (deadlinesSection) deadlinesSection.style.display = 'none';
      return;
    }

    if (deadlinesSection) deadlinesSection.style.display = 'block';
    if (!deadlinesTimeline) return;

    deadlinesTimeline.innerHTML = '';
    deadlines.forEach((deadline, index) => {
      const item = document.createElement('div');
      item.className = `deadline-item ${deadline.isUrgent ? 'urgent' : 'normal'}`;

      item.innerHTML = `
        <div class="deadline-indicator">
          <div class="deadline-dot"></div>
          ${index < deadlines.length - 1 ? '<div class="deadline-line"></div>' : ''}
        </div>
        <div class="deadline-content">
          <div class="deadline-header">
            <h5>${deadline.title}</h5>
            <span class="deadline-days">${deadline.days} dias</span>
          </div>
          <p class="deadline-description">${deadline.description}</p>
          ${deadline.isUrgent ? '<span class="deadline-badge urgent">URGENTE</span>' : '<span class="deadline-badge normal">Normal</span>'}
        </div>
      `;
      deadlinesTimeline.appendChild(item);
    });
  }

  private fillAdditionalInfo(doc: DocumentModel) {
    const additionalSection = document.getElementById('additional-info-section');
    const estimatedCostEl = document.getElementById('estimated-cost');
    const processingTimeEl = document.getElementById('processing-time');
    const jurisdictionEl = document.getElementById('jurisdiction');

    if (doc.estimatedCost !== undefined || doc.processingTime || doc.jurisdiction) {
      if (additionalSection) additionalSection.style.display = 'block';

      if (estimatedCostEl && doc.estimatedCost !== undefined) {
        estimatedCostEl.textContent = doc.estimatedCost === 0 ? 'Gratuito' :
          `R$ ${doc.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }

      if (processingTimeEl && doc.processingTime) {
        processingTimeEl.textContent = doc.processingTime;
      }

      if (jurisdictionEl && doc.jurisdiction) {
        jurisdictionEl.textContent = doc.jurisdiction;
      }
    } else {
      if (additionalSection) additionalSection.style.display = 'none';
    }
  }

  private resetProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressCount = document.getElementById('progress-count');

    if (progressFill) progressFill.style.width = '0%';
    if (progressCount && this.currentDocument) {
      progressCount.textContent = `0 / ${this.currentDocument.required.length}`;
    }
  }

  private submitDocuments() {
    if (!this.currentDocument) return;

    // Simular progresso
    this.switchTab('progress');
    this.updateProgress();
  }

  private updateProgress() {
    if (!this.currentDocument) return;

    const progressList = document.getElementById('progress-list');
    if (!progressList) return;

    progressList.innerHTML = '';
    this.currentDocument.required.forEach((req, index) => {
      const uploaded = Math.random() > 0.3; // Simular upload
      const item = document.createElement('div');
      item.className = 'progress-item';
      item.innerHTML = `
        <div class="progress-icon ${uploaded ? 'uploaded' : ''}">
          ${uploaded ? '<ion-icon name="checkmark-circle-outline"></ion-icon>' : `<span class="progress-number">${index + 1}</span>`}
        </div>
        <div class="progress-content">
          <p class="progress-name">${req}</p>
          ${uploaded ? '<div class="progress-status processando"><ion-icon name="time-outline"></ion-icon>Processando</div>' : ''}
        </div>
      `;
      progressList.appendChild(item);
    });

    // Atualizar barra
    const uploaded = this.currentDocument.required.filter(() => Math.random() > 0.3).length;
    const progressFill = document.getElementById('progress-fill');
    const progressCount = document.getElementById('progress-count');

    if (progressFill) {
      progressFill.style.width = `${(uploaded / this.currentDocument.required.length) * 100}%`;
    }
    if (progressCount) {
      progressCount.textContent = `${uploaded} / ${this.currentDocument.required.length}`;
    }
  }

  private closeModal() {
    const modal = document.querySelector('.modal-documentos');
    if (modal) {
      (modal as HTMLElement).style.display = 'none';
    }

    // Reset
    this.uploadedFiles = [];
    this.currentDocument = null;
    this.switchTab('upload');

    // Limpar checkboxes
    const checkboxes = document.querySelectorAll('.eligibility-check') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);
  }
}
