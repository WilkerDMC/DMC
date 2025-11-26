import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Permite usar ion-icon
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit {
  searchTerm: string = ''; // Armazena o texto da busca

  // Cards data
  cards = [
    { id: 1, value: '1,504', name: 'Clientes', icon: 'people-outline', class: 'clientes' },
    { id: 2, value: '8', name: 'Diligências', icon: 'checkbox-outline', class: 'diligencias' },
    { id: 3, value: '80', name: 'Casos', icon: 'briefcase-outline', class: 'casos' },
    { id: 4, value: 'R$200,000', name: 'Receita', icon: 'cash-outline', class: 'receita' }
  ];

  constructor(private router: Router) {}

  // Mouse move effect para cards
  onMouseMove(event: MouseEvent, cardElement: HTMLElement) {
    const rect = cardElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    cardElement.style.setProperty('--mouse-x', `${x}px`);
    cardElement.style.setProperty('--mouse-y', `${y}px`);
  }

  // Executa após a view estar carregada
  ngAfterViewInit() {
    const list = document.querySelectorAll<HTMLElement>('.navigation li');

    // efeito hover com bordas arredondadas
    list.forEach((item) => {
      item.addEventListener('mouseover', (event) => {
        list.forEach((li) => li.classList.remove('hovered'));
        const target = event.currentTarget as HTMLElement;
        target.classList.add('hovered');
      });
    });

    // Toggle do menu
    const toggle = document.querySelector<HTMLElement>('.toggle');
    const navigation = document.querySelector<HTMLElement>('.navigation');
    const main = document.querySelector<HTMLElement>('.main');

    if (toggle && navigation && main) {
      toggle.onclick = () => {
        navigation.classList.toggle('active');
        main.classList.toggle('active');
      };
    }

    // Inicializa o calendário e gráfico com delay para garantir que DOM está pronto
    setTimeout(() => {
      this.initCalendar();
      this.initBarChart();
    }, 300);

    // Re-desenha o gráfico quando a janela é redimensionada
    window.addEventListener('resize', () => {
      this.initBarChart();
    });
  }

  // Função de busca
  onSearch() {
    if (this.searchTerm.trim()) {
      console.log('Buscando por:', this.searchTerm);
    }
  }

  // Lógica do calendário
  private initCalendar() {
    const mesAno = document.getElementById('month-year');
    const daysContainer = document.getElementById('days');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    if (!mesAno || !daysContainer || !prevBtn || !nextBtn) {
      console.error('Elementos do calendário não encontrados');
      return;
    }

    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let currentDate = new Date();

    const mostrarCalendario = (date: Date) => {
      const ano = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(ano, month, 1).getDay();
      const lastDay = new Date(ano, month + 1, 0).getDate();

      mesAno.textContent = `${months[month]} ${ano}`;
      daysContainer.innerHTML = '';

      console.log(`Calendário: ${months[month]} ${ano}, Primeiro dia: ${firstDay}, Último dia: ${lastDay}`);

      // Dias vazios antes do primeiro dia
      for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        daysContainer.appendChild(emptyDiv);
      }

      // Dias do mês
      for (let day = 1; day <= lastDay; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day.toString();
        dayDiv.classList.add('day');

        // Destacar dia atual
        const today = new Date();
        if (day === today.getDate() &&
            month === today.getMonth() &&
            ano === today.getFullYear()) {
          dayDiv.classList.add('today');
          console.log(` Dia de hoje encontrado: ${day}/${month + 1}/${ano}`);
        }

        // Click event para selecionar dia
        dayDiv.addEventListener('click', () => {
          console.log(`Dia selecionado: ${day}/${month + 1}/${ano}`);
          // Aqui você pode adicionar lógica para mostrar compromissos do dia
        });

        daysContainer.appendChild(dayDiv);
      }
    };

    mostrarCalendario(currentDate);

    prevBtn.onclick = () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      mostrarCalendario(currentDate);
    };

    nextBtn.onclick = () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      mostrarCalendario(currentDate);
    };
  }

  // Gera gráfico de linhas simples
  private initBarChart() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;

    if (!canvas) {
      console.error('❌ Canvas não encontrado - aguardando DOM...');
      // Tenta novamente após um delay
      setTimeout(() => this.initBarChart(), 500);
      return;
    }

    console.log('✅ Canvas encontrado, criando gráfico...');

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Contexto 2D não disponível');
      return;
    }

    // Força o canvas a ter dimensões do container pai
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.offsetWidth || 600;
      canvas.height = 200;
    } else {
      canvas.width = 600;
      canvas.height = 200;
    }

    console.log(`📐 Canvas: ${canvas.width}x${canvas.height}px`);

    // Dados do gráfico
    const dados = [30, 50, 45, 70, 65, 85, 60];
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Limpa canvas
    ctx.clearRect(0, 0, width, height);

    // Desenha grid de fundo
    ctx.strokeStyle = 'rgba(0, 231, 252, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Calcula pontos
    const points: Array<{x: number, y: number}> = [];
    const stepX = graphWidth / (dados.length - 1);
    const maxValue = Math.max(...dados);

    dados.forEach((value, index) => {
      const x = padding + stepX * index;
      const y = padding + graphHeight - (value / maxValue) * graphHeight;
      points.push({ x, y });
    });

    // Desenha área sob a linha (gradiente)
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(0, 231, 252, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 77, 0.1)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();

    // Desenha linha principal
    ctx.strokeStyle = '#00E7FC';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();

    // Desenha pontos
    points.forEach((point, index) => {
      // Círculo externo (glow)
      ctx.fillStyle = 'rgba(0, 231, 252, 0.3)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Círculo interno
      ctx.fillStyle = '#00E7FC';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Labels dos dias
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], point.x, height - padding + 20);

      // Valores
      ctx.fillStyle = '#00FF4D';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(dados[index].toString(), point.x, point.y - 15);
    });

    console.log('✅ Gráfico de linhas criado');
  }
}
