import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Calendar {
  // Usuários responsáveis (sidebar / faixa superior)
  users = [
    { id: 1, name: 'Matheus Vital Gomes', type: 'Advogado', avatar: 'M', status: 'online' },
    { id: 2, name: 'Wilker s ', type: 'Funcionário', avatar: 'W', status: 'online' },
    { id: 3, name: 'Guilherme', type: 'Advogado', avatar: 'G', status: 'offline' },
    { id: 4, name: 'Cartorio Souza Lima', type: 'Cartório', avatar: 'CS', status: 'online' },
  ];

  selectedUser = this.users[0];

  // Dicionários de filtros
  statusList = ['Pendente', 'Em andamento', 'Concluída', 'Cancelada'];
  urgencyList = ['Leve', 'Média', 'Alta'];
  userTypeList = ['Todos', 'Advogada', 'Funcionário', 'Empresa'];
  periodList = ['Hoje', 'Esta semana', 'Este mês'];

  statusFilter = '';
  urgencyFilter = '';
  userTypeFilter = 'Todos';
  periodFilter = 'Este mês';

  // Estrutura de diligências
  tasks = [
    {
      id: 1,
      userId: 1,
      title: 'Inventário Judicial',
      date: '2025-12-10',
      time: '09:00',
      status: 'Pendente',
      urgency: 'Alta',
      color: 'red',
      description: 'Audiência de conciliação trabalhista - Vara do Trabalho 3ª Região.',
    },
    {
      id: 2,
      userId: 1,
      title: 'Protocolar Petição',
      date: '2025-12-11',
      time: '14:00',
      status: 'Em andamento',
      urgency: 'Média',
      color: 'orange',
      description: 'Protocolo de petição inicial no processo 0001234-56.2025.8.09.0001.',
    },
    {
      id: 3,
      userId: 2,
      title: 'Retirada de Certidão',
      date: '2025-12-12',
      time: '16:00',
      status: 'Concluída',
      urgency: 'Leve',
      color: 'green',
      description: 'Retirada de certidão no cartório de registro civil.',
    },
    {
      id: 4,
      userId: 3,
      title: 'Reunião com Cliente',
      date: '2025-12-13',
      time: '10:30',
      status: 'Pendente',
      urgency: 'Média',
      color: 'cyan',
      description: 'Reunião de alinhamento de estratégia processual.',
    },
  ];

  // Semana e datas
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  calendarDays: Date[] = [];
  selectedDay: Date | null = new Date();

  // Painel direito
  selectedTask: any | null = null;
  isCreatingTask = false;

  // Notificações
  notificationMessage = '';
  notificationTimeout: any;

  // Filtro texto / data direta
  taskSearch = '';
  dateFilter = '';

  // Formulário de nova diligência
  newTask = {
    title: '',
    date: '',
    time: '',
    description: '',
    status: 'Pendente',
    urgency: 'Média',
    color: 'cyan',
  };

  // Visualização: mês / semana / dia
  calendarView: 'month' | 'week' | 'day' = 'month';

  get monthName(): string {
    return this.currentDate.toLocaleString('pt-BR', { month: 'long' });
  }

  constructor() {
    this.generateCalendarDays();
  }

  // ======= CÁLCULO DE DATAS =======
  generateCalendarDays() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const days: Date[] = [];

    // Dias do mês anterior para completar a primeira linha
    for (let i = firstDay.getDay(); i > 0; i--) {
      const prev = new Date(this.currentYear, this.currentMonth, 1 - i);
      days.push(prev);
    }

    // Dias do mês atual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(this.currentYear, this.currentMonth, d));
    }

    // Dias do próximo mês para completar a grade
    while (days.length % 7 !== 0) {
      const next = new Date(this.currentYear, this.currentMonth, lastDay.getDate() + (days.length % 7));
      days.push(next);
    }

    this.calendarDays = days;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.currentDate = new Date(this.currentYear, this.currentMonth, 1);
    this.generateCalendarDays();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.currentDate = new Date(this.currentYear, this.currentMonth, 1);
    this.generateCalendarDays();
  }

  goToday() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.currentDate = new Date(this.currentYear, this.currentMonth, 1);
    this.selectedDay = today;
    this.generateCalendarDays();
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  }

  isSameMonth(day: Date): boolean {
    return day.getMonth() === this.currentMonth && day.getFullYear() === this.currentYear;
  }

  // ======= TAREFAS / DILIGÊNCIAS =======
  formatDateKey(day: Date): string {
    return day.toISOString().slice(0, 10);
  }

  hasTask(day: Date): boolean {
    const dateKey = this.formatDateKey(day);
    return this.filteredTasks().some(task => task.date === dateKey);
  }

  getTasksForDay(day: Date) {
    const dateKey = this.formatDateKey(day);
    return this.filteredTasks().filter(task => task.date === dateKey);
  }

  selectDay(day: Date) {
    this.selectedDay = day;
    // Se houver tarefas, seleciona a primeira no painel
    const tasks = this.getTasksForDay(day);
    this.selectedTask = tasks[0] || null;
    this.isCreatingTask = false;
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.selectedTask = null;
  }

  selectTask(task: any) {
    this.selectedTask = task;
    this.isCreatingTask = false;
  }

  startCreateTask() {
    this.isCreatingTask = true;
    this.selectedTask = null;
    const baseDate = this.selectedDay ? this.formatDateKey(this.selectedDay) : this.formatDateKey(new Date());
    this.newTask = {
      title: '',
      date: baseDate,
      time: '09:00',
      description: '',
      status: 'Pendente',
      urgency: 'Média',
      color: 'cyan',
    };
  }

  // Filtros combináveis
  filteredTasks() {
    return this.tasks.filter(task => {
      const matchesUser = task.userId === this.selectedUser.id;
      const matchesStatus = this.statusFilter ? task.status === this.statusFilter : true;
      const matchesUrgency = this.urgencyFilter ? task.urgency === this.urgencyFilter : true;
      const matchesUserType =
        this.userTypeFilter === 'Todos'
          ? true
          : this.users.find(u => u.id === task.userId)?.type === this.userTypeFilter;
      const matchesSearch = this.taskSearch
        ? task.title.toLowerCase().includes(this.taskSearch.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(this.taskSearch.toLowerCase()))
        : true;
      const matchesDate = this.dateFilter ? task.date === this.dateFilter : true;
      const matchesPeriod = this.matchesPeriod(task.date);

      return (
        matchesUser &&
        matchesStatus &&
        matchesUrgency &&
        matchesUserType &&
        matchesSearch &&
        matchesDate &&
        matchesPeriod
      );
    });
  }

  private matchesPeriod(dateStr: string): boolean {
    const date = new Date(dateStr);
    const today = new Date();
    if (this.periodFilter === 'Hoje') {
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }
    if (this.periodFilter === 'Esta semana') {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return date >= start && date <= end;
    }
    // Este mês (padrão)
    return date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear;
  }

  // Contadores inteligentes
  get totalTasksForUser(): number {
    return this.tasks.filter(t => t.userId === this.selectedUser.id).length;
  }

  get pendingTasksForUser(): number {
    return this.tasks.filter(t => t.userId === this.selectedUser.id && t.status === 'Pendente').length;
  }

  get urgentTasksForUser(): number {
    return this.tasks.filter(t => t.userId === this.selectedUser.id && t.urgency === 'Alta').length;
  }

  // Método para adicionar tarefa pelo formulário do painel direito
  addTask() {
    if (!this.newTask.title || !this.newTask.date || !this.newTask.time) return;

    this.tasks.push({
      id: this.tasks.length + 1,
      userId: this.selectedUser.id,
      title: this.newTask.title,
      date: this.newTask.date,
      time: this.newTask.time,
      description: this.newTask.description,
      status: this.newTask.status,
      urgency: this.newTask.urgency,
      color: this.newTask.color,
    });

    this.showNotification('Diligência criada com sucesso!');
    this.isCreatingTask = false;
    this.selectedTask = this.tasks[this.tasks.length - 1];
  }

  // ======= DRAG & DROP SIMPLES ENTRE DIAS (VISÃO MÊS/SEMANA) =======
  onTaskDragStart(event: DragEvent, task: any) {
    event.dataTransfer?.setData('text/plain', String(task.id));
    event.dataTransfer?.setDragImage?.(event.target as Element, 10, 10);
  }

  onDayDrop(event: DragEvent, day: Date) {
    event.preventDefault();
    const idStr = event.dataTransfer?.getData('text/plain');
    if (!idStr) return;
    const task = this.tasks.find(t => t.id === Number(idStr));
    if (!task) return;
    task.date = this.formatDateKey(day);
    this.showNotification('Diligência remanejada para o novo dia.');
    this.selectedDay = day;
  }

  onDayDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // ======= VIEWS (MÊS / SEMANA / DIA) =======
  setCalendarView(view: 'month' | 'week' | 'day') {
    this.calendarView = view;
  }

  getWeekDays(): Date[] {
    const base = this.selectedDay || new Date();
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  getDayView(): Date[] {
    return this.selectedDay ? [this.selectedDay] : [];
  }

  // Helper para obter o nome do usuário a partir do id (evita arrow functions no template)
  getUserNameById(userId: number | undefined | null): string {
    if (!userId) return '';
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : '';
  }

  // Classe de status segura para usar no CSS (evita espaços/acentos)
  statusClass(status: string): string {
    switch (status) {
      case 'Pendente':
        return 'status-pendente';
      case 'Em andamento':
        return 'status-em-andamento';
      case 'Concluída':
        return 'status-concluida';
      case 'Cancelada':
        return 'status-cancelada';
      default:
        return '';
    }
  }

  // ======= NOTIFICAÇÕES =======
  showNotification(message: string) {
    this.notificationMessage = message;
    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      this.notificationMessage = '';
    }, 2500);
  }
}
