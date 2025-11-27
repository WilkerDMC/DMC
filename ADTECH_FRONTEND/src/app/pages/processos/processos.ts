import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-processos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './processos.html',
  styleUrl: './processos.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Processos implements OnInit, AfterViewInit {
  searchTerm: string = '';
  filtroStatus: string = 'todos';
  filtroTipo: string = '';

  // Propriedades para submenus
  submenuAcoes: boolean = false;
  submenuVisualizacao: boolean = false;
  submenuExportar: boolean = false;

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
      proximaAudiencia: '10/12/2024'
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
      proximaAudiencia: '05/12/2024'
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
      proximaAudiencia: '-'
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
      proximaAudiencia: '15/12/2024'
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
      proximaAudiencia: '20/12/2024'
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
      proximaAudiencia: '18/12/2024'
    }
  ];

  get processosFiltrados() {
    return this.processos.filter(p => {
      const matchStatus = this.filtroStatus === 'todos' || p.status === this.filtroStatus;
      const matchTipo = !this.filtroTipo || p.tipo === this.filtroTipo;
      const matchSearch = !this.searchTerm ||
        p.numero.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.cliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.responsavel.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchStatus && matchTipo && matchSearch;
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
}
