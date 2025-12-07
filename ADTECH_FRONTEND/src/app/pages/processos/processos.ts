import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-processos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './processos.html',
  styleUrl: './processos.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None // Permite herdar estilos do dashboard
})
export class Processos implements OnInit, AfterViewInit {

  constructor(private router: Router) {}
  searchTerm: string = '';
  filtroStatus: string = 'todos';
  filtroTipo: string = '';
  filtroPrioridade: string = '';
  filtroPeriodo: string = '';
  filtroResponsavel: string = '';
  showProfileMenu: boolean = false;
  mostrarFiltrosAvancados: boolean = false;
  viewMode: string = 'list';

  // Propriedades para submenus
  submenuAcoes: boolean = false;
  submenuVisualizacao: boolean = false;
  submenuExportar: boolean = false;

  // Propriedades para paginação
  currentPage: number = 1;
  itemsPerPage: number = 10;
  Math = Math;

  processos = [
    {
      numero: '0001234-56.2024.5.01.0001',
      cliente: 'Maria Silva Santos',
      tipo: 'Trabalhista',
      dataAbertura: '15/01/2024',
      status: 'Em Andamento',
      statusClass: 'andamento',
      prioridade: 'Alta',
      responsavel: 'Dr. João Santos',
      valorCausa: 'R$ 50.000,00',
      proximaAudiencia: '10/12/2024',
      expanded: false
    },
    {
      numero: '0001235-89.2024.8.01.0002',
      cliente: 'João Oliveira Costa',
      tipo: 'Cível',
      dataAbertura: '20/01/2024',
      status: 'Pendente',
      statusClass: 'pendente',
      prioridade: 'Média',
      responsavel: 'Dra. Ana Costa',
      valorCausa: 'R$ 35.000,00',
      proximaAudiencia: '05/12/2024',
      expanded: false
    },
    {
      numero: '0001236-12.2024.8.01.0003',
      cliente: 'Pedro Santos Lima',
      tipo: 'Criminal',
      dataAbertura: '25/01/2024',
      status: 'Concluído',
      statusClass: 'concluido',
      prioridade: 'Alta',
      responsavel: 'Dr. Carlos Lima',
      valorCausa: '-',
      proximaAudiencia: '-',
      expanded: false
    },
    {
      numero: '0001237-45.2024.5.01.0004',
      cliente: 'Ana Paula Souza',
      tipo: 'Trabalhista',
      dataAbertura: '01/02/2024',
      status: 'Em Andamento',
      statusClass: 'andamento',
      prioridade: 'Alta',
      responsavel: 'Dr. João Santos',
      valorCausa: 'R$ 80.000,00',
      proximaAudiencia: '15/12/2024',
      expanded: false
    },
    {
      numero: '0001238-78.2024.8.01.0005',
      cliente: 'Carlos Eduardo Mendes',
      tipo: 'Família',
      dataAbertura: '10/02/2024',
      status: 'Pendente',
      statusClass: 'pendente',
      prioridade: 'Baixa',
      responsavel: 'Dra. Mariana Alves',
      valorCausa: 'R$ 15.000,00',
      proximaAudiencia: '20/12/2024',
      expanded: false
    },
    {
      numero: '0001239-91.2024.8.01.0006',
      cliente: 'Fernanda Costa Reis',
      tipo: 'Consumidor',
      dataAbertura: '15/02/2024',
      status: 'Em Andamento',
      statusClass: 'andamento',
      prioridade: 'Média',
      responsavel: 'Dr. Roberto Silva',
      valorCausa: 'R$ 12.000,00',
      proximaAudiencia: '18/12/2024',
      expanded: false
    }
  ];

  get processosFiltrados() {
    return this.processos.filter(p => {
      const matchStatus = this.filtroStatus === 'todos' ||
        p.status.toLowerCase() === this.filtroStatus.toLowerCase();
      const matchTipo = !this.filtroTipo || p.tipo === this.filtroTipo;
      const matchPrioridade = !this.filtroPrioridade || p.prioridade === this.filtroPrioridade;
      const matchResponsavel = !this.filtroResponsavel || p.responsavel === this.filtroResponsavel;
      const matchSearch = !this.searchTerm ||
        p.numero.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.cliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.responsavel.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchStatus && matchTipo && matchPrioridade && matchResponsavel && matchSearch;
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const list = document.querySelectorAll<HTMLElement>('.navigation li');

    list.forEach((item) => {
      item.addEventListener('mouseover', (event) => {
        list.forEach((li) => li.classList.remove('hovered'));
        const target = event.currentTarget as HTMLElement;
        target.classList.add('hovered');
      });
    });

    const toggle = document.querySelector<HTMLElement>('.toggle');
    const navigation = document.querySelector<HTMLElement>('.navigation');
    const main = document.querySelector<HTMLElement>('.main');

    toggle?.addEventListener('click', () => {
      navigation?.classList.toggle('active');
      main?.classList.toggle('active');
    });
  }

  toggleSubmenu(menu: string) {
    if (menu === 'acoes') {
      this.submenuAcoes = !this.submenuAcoes;
      this.submenuVisualizacao = false;
      this.submenuExportar = false;
    } else if (menu === 'visualizacao') {
      this.submenuVisualizacao = !this.submenuVisualizacao;
      this.submenuAcoes = false;
      this.submenuExportar = false;
    } else if (menu === 'exportar') {
      this.submenuExportar = !this.submenuExportar;
      this.submenuAcoes = false;
      this.submenuVisualizacao = false;
    }
  }

  aplicarFiltro(filtro: string) {
    this.filtroStatus = filtro;
  }

  aplicarFiltroStatus(status: string) {
    this.filtroStatus = status;
  }

  getTotalProcessos(): number {
    return this.processos.length;
  }

  getCountByStatus(status: string): number {
    return this.processos.filter(p => p.status.toLowerCase() === status.toLowerCase()).length;
  }

  toggleFiltrosAvancados() {
    this.mostrarFiltrosAvancados = !this.mostrarFiltrosAvancados;
  }

  aplicarFiltros() {
    // Os filtros já são aplicados automaticamente através do getter processosFiltrados
    console.log('Aplicando filtros...');
  }

  limparFiltros() {
    this.filtroTipo = '';
    this.filtroPrioridade = '';
    this.filtroPeriodo = '';
    this.filtroResponsavel = '';
    this.filtroStatus = 'todos';
  }

  changeViewMode(mode: string) {
    this.viewMode = mode;
  }

  imprimirRelatorio() {
    console.log('Imprimindo relatório...');
    window.print();
  }

  novoProcesso() {
    console.log('Criar novo processo');
    // modal ou navegação
  }

  editarProcesso() {
    console.log('Editar processo selecionado');
  }

  arquivarProcesso() {
    console.log('Arquivar processo');
  }

  exportarPDF() {
    console.log('Exportar para PDF');
  }

  exportarExcel() {
    console.log('Exportar para Excel');
  }

  onSearch() {
    console.log('Buscando:', this.searchTerm);
  }

  viewProcess(processo: any) {
    console.log('Visualizar processo:', processo);
  }

  editProcess(processo: any) {
    console.log('Editar processo:', processo);
  }

  deleteProcess(processo: any) {
    if (confirm(`Deseja realmente excluir o processo ${processo.numero}?`)) {
      const index = this.processos.indexOf(processo);
      if (index > -1) {
        this.processos.splice(index, 1);
      }
    }
  }

  onMouseMove(event: MouseEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    element.style.setProperty('--mouse-x', `${x}px`);
    element.style.setProperty('--mouse-y', `${y}px`);
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  goToSettings(event: Event) {
    event.stopPropagation();
    console.log('Ir para configurações');
    this.showProfileMenu = false;
  }

  logout() {
    console.log('Fazendo logout...');
    this.showProfileMenu = false;
    // Adicionar lógica de logout aqui
  }

  // Métodos para o accordion da tabela
  toggleProcesso(processo: any) {
    console.log('Toggle processo:', processo.numero, 'expanded:', processo.expanded);
    processo.expanded = !processo.expanded;
    console.log('Novo estado:', processo.expanded);
  }

  isPrazoUrgente(processo: any): boolean {
    if (!processo.proximaAudiencia || processo.proximaAudiencia === '-') {
      return false;
    }
    // Lógica para verificar se o prazo está próximo
    const hoje = new Date();
    const prazo = new Date(processo.proximaAudiencia.split('/').reverse().join('-'));
    const diffDias = Math.floor((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias <= 7 && diffDias >= 0;
  }

  gerenciarDocumentos(processo: any) {
    console.log('Gerenciar documentos do processo:', processo);
    // Implementar navegação para gestão de documentos
  }

  verHistorico(processo: any) {
    console.log('Ver histórico completo do processo:', processo);
    // Implementar modal ou navegação para histórico completo
  }

  imprimirProcesso(processo: any) {
    console.log('Imprimir ficha do processo:', processo);
    // Implementar impressão da ficha do processo
  }

  // Métodos para paginação
  get totalPages(): number {
    return Math.ceil(this.processosFiltrados.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
