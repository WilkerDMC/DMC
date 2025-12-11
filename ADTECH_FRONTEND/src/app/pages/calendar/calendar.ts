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
  users = [
    { id: 1, name: 'Ana Souza', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', status: 'online' },
    { id: 2, name: 'Carlos Lima', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', status: 'offline' },
    { id: 3, name: 'Julia Alves', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', status: 'online' },
    { id: 4, name: 'Pedro Silva', avatar: 'https://randomuser.me/api/portraits/men/76.jpg', status: 'offline' },
  ];

  selectedUser = this.users[0];
  statusList = ['Pendente', 'Em andamento', 'Concluída'];
  statusFilter = '';
  tasks = [
    { id: 1, userId: 1, title: 'Reunião com equipe', date: '2025-12-10', time: '09:00', status: 'Pendente', description: 'Discutir metas do mês.' },
    { id: 2, userId: 1, title: 'Enviar relatório', date: '2025-12-11', time: '14:00', status: 'Em andamento', description: 'Relatório financeiro semanal.' },
    { id: 3, userId: 2, title: 'Atualizar sistema', date: '2025-12-12', time: '16:00', status: 'Concluída', description: 'Deploy da nova versão.' },
    { id: 4, userId: 3, title: 'Treinamento', date: '2025-12-13', time: '10:30', status: 'Pendente', description: 'Treinamento de onboarding.' },
  ];

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  calendarDays: Date[] = [];
  selectedDay: Date | null = null;
  showAddTaskModal = false;
  modalTask = {
    title: '',
    time: '',
    description: '',
    status: 'Pendente',
  };

  // Adiciona notificação visual ao adicionar tarefa
  notificationMessage = '';
  notificationTimeout: any;

  // Filtro de tarefas para exibição
  taskSearch = '';
  dateFilter = '';

  filteredTasks() {
    return this.tasks.filter(task => {
      const matchesUser = task.userId === this.selectedUser.id;
      const matchesStatus = this.statusFilter ? task.status === this.statusFilter : true;
      const matchesDate = this.dateFilter ? task.date === this.dateFilter : true;
      const matchesSearch = this.taskSearch ? (task.title.toLowerCase().includes(this.taskSearch.toLowerCase()) || (task.description && task.description.toLowerCase().includes(this.taskSearch.toLowerCase()))) : true;
      return matchesUser && matchesStatus && matchesDate && matchesSearch;
    });
  }

  // Propriedade para novo formulário de tarefa
  newTask = {
    title: '',
    date: '',
    time: '',
    description: '',
    status: 'Pendente',
  };

  // Alternância de visualização do calendário
  calendarView: 'month' | 'week' | 'day' = 'month';

  get monthName(): string {
    return this.currentDate.toLocaleString('pt-BR', { month: 'long' });
  }

  constructor() {
    this.generateCalendarDays();
  }

  generateCalendarDays() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const days: Date[] = [];
    // Preencher dias do mês anterior
    for (let i = firstDay.getDay(); i > 0; i--) {
      const prev = new Date(this.currentYear, this.currentMonth, 1 - i);
      days.push(prev);
    }
    // Dias do mês atual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(this.currentYear, this.currentMonth, d));
    }
    // Preencher dias do próximo mês
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

  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear();
  }

  hasTask(day: Date): boolean {
    return this.tasks.some(task => task.date === day.toISOString().slice(0, 10) && task.userId === this.selectedUser.id);
  }

  getTasksForDay(day: Date) {
    return this.tasks.filter(task => task.date === day.toISOString().slice(0, 10) && task.userId === this.selectedUser.id);
  }

  selectUser(user: any) {
    this.selectedUser = user;
  }

  openAddTaskModal(day: Date) {
    this.selectedDay = day;
    this.showAddTaskModal = true;
    this.modalTask = {
      title: '',
      time: '',
      description: '',
      status: 'Pendente',
    };
  }

  closeAddTaskModal() {
    this.showAddTaskModal = false;
  }

  showNotification(message: string) {
    this.notificationMessage = message;
    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      this.notificationMessage = '';
    }, 2500);
  }

  // Método para adicionar tarefa pelo formulário
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
    });
    this.showNotification('Tarefa adicionada com sucesso!');
    this.newTask = {
      title: '',
      date: '',
      time: '',
      description: '',
      status: 'Pendente',
    };
  }

  setCalendarView(view: 'month' | 'week' | 'day') {
    this.calendarView = view;
  }

  // Função para obter os dias da semana atual
  getWeekDays(): Date[] {
    if (!this.selectedDay) return [];
    const start = new Date(this.selectedDay);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  // Função para obter apenas o dia selecionado
  getDayView(): Date[] {
    return this.selectedDay ? [this.selectedDay] : [];
  }
}
