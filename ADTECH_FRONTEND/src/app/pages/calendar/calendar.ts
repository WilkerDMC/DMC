
import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, LOCALE_ID, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import localePt from '@angular/common/locales/pt';

// Registra o locale pt-BR
registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatButtonToggleModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})


export class Calendar {
  @ViewChild('popupContainer') popupContainer!: ElementRef;

  // Popup lateral state
  isPopupOpen = false;
  popupPosition = { top: 0, left: 0 };
  popupSide: 'left' | 'right' = 'right';

  isSidePanelOpen = false;
  // Usuários responsáveis (sidebar / faixa superior)
  users = [
    { id: 1, name: 'Matheus Vital Gomes', type: 'Advogado', avatar: 'M', status: 'online' },
    { id: 2, name: 'Wilker s ', type: 'Funcionário', avatar: 'W', status: 'online' },
    { id: 3, name: 'Guilherme', type: 'Advogado', avatar: 'G', status: 'offline' },
    { id: 4, name: 'Cartorio Souza Lima', type: 'Cartório', avatar: 'CS', status: 'online' },
  ];

  selectedUser = this.users[0];
  selectedUsers: number[] = []; // Array de IDs de usuários selecionados
  // Dicionários de filtros
  statusList = ['Pendente', 'Em andamento', 'Concluída', 'Cancelada'];
  urgencyList = ['Leve', 'Média', 'Alta'];
  userTypeList = ['Todos', 'Advogada', 'Funcionário', 'Empresa'];
  periodList = ['Hoje', 'Esta semana', 'Este mês'];

  statusFilter = '';
  urgencyFilter = '';
  userTypeFilter = 'Todos';
  periodFilter = 'Este mês';

  // Cache para lista agrupada
  groupedTasksCache: any[] = [];

  // Caches para views (evita recálculos em cada change detection)
  weekDaysCache: Date[] = [];
  weekTasksCache: Map<string, any[]> = new Map();
  dayAllDayTasksCache: any[] = [];
  dayTimedTasksCache: any[] = [];
  dayTasksCache: any[] = [];

  // Estrutura de diligências
  tasks: any[] = [
    {
      id: 1,
      userId: 1,
      title: 'Inventário Judicial',
      startDate: '2025-12-10',
      endDate: '2025-12-10',
      date: '2025-12-10',
      time: '09:00',
      deadline: '2025-12-15',
      createdAt: '2025-12-05',
      status: 'Pendente',
      urgency: 'Alta',
      color: '#ff4757',
      description: 'Audiência de conciliação trabalhista - Vara do Trabalho 3ª Região.',
      isMultiDay: false,
    },
    {
      id: 2,
      userId: 1,
      title: 'Protocolar Petição',
      startDate: '2025-12-11',
      endDate: '2025-12-13',
      date: '2025-12-11',
      time: '14:00',
      deadline: '2025-12-20',
      createdAt: '2025-12-08',
      status: 'Em andamento',
      urgency: 'Média',
      color: '#ff9800',
      description: 'Protocolo de petição inicial no processo 0001234-56.2025.8.09.0001.',
      isMultiDay: true,
    },
    {
      id: 3,
      userId: 2,
      title: 'Retirada de Certidão',
      startDate: '2025-12-12',
      endDate: '2025-12-12',
      date: '2025-12-12',
      time: '16:00',
      deadline: '2025-12-12',
      createdAt: '2025-12-10',
      status: 'Concluída',
      urgency: 'Leve',
      color: '#00ff4d',
      description: 'Retirada de certidão no cartório de registro civil.',
      isMultiDay: false,
    },
    {
      id: 4,
      userId: 3,
      title: 'Reunião com Cliente',
      startDate: '2025-12-19',
      endDate: '2025-12-21',
      date: '2025-12-19',
      time: '10:30',
      deadline: '2025-12-25',
      createdAt: '2025-12-15',
      status: 'Pendente',
      urgency: 'Média',
      color: '#00e7fc',
      description: 'Reunião de alinhamento de estratégia processual.',
      isMultiDay: true,
    },
  ];

  // Drag & Drop state
  draggedTask: any = null;
  isDragging = false;
  resizingTask: any = null;
  resizeDirection: 'start' | 'end' | null = null;
  dragOverDay: Date | null = null;

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

  // Formulário de nova diligência expandido
  newTask: any = {
    title: '',
    startDate: '',
    endDate: '',
    date: '',
    time: '',
    endTime: '',
    deadline: '',
    createdAt: '',
    description: '',
    status: 'Pendente',
    urgency: 'Média',
    color: '#00e7fc',
    isMultiDay: false,
    isAllDay: false,
    location: '',
    guests: [] as string[],
    labels: [] as string[],
    checklist: [] as {id: number, text: string, done: boolean}[],
    notifications: [] as {time: number, unit: string}[],
    repeat: 'never',
    notes: [] as {id: number, author: string, avatar: string, text: string, date: string, time: string}[],
    tags: [] as string[],
    attendees: [] as any[],
    attachments: [] as any[],
    linkedProcess: '',
    reminder: '',
  };

  // Campo de nova nota/comunicação
  newNoteText = '';

  // Campos auxiliares do popup
  newGuestEmail = '';
  newLabelText = '';
  newChecklistItem = '';
  availableLabels = [
    { text: 'Urgente', color: '#ff4757' },
    { text: 'Importante', color: '#ff9800' },
    { text: 'Reunião', color: '#00e7fc' },
    { text: 'Prazo', color: '#a855f7' },
    { text: 'Pessoal', color: '#00ff4d' },
  ];

  // Modo de edição
  isEditingTask = false;
  editingTaskId: number | null = null;

  // Visualização: mês / semana / dia / lista
  calendarView: 'month' | 'week' | 'day' | 'list' = 'month';

  // Ordenação da lista
  listSortBy: 'date' | 'time' | 'urgency' | 'status' = 'date';

  // Timeline de horas para visualização semanal/diária
  timeSlots = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

  // Chat
  isChatOpen = false;
  selectedChatUser: any = null;
  currentUserId = 1; // ID do usuário atual (pode ser dinâmico)
  chatMessageInput = '';
  chatMessages: any[] = [
    { id: 1, senderId: 1, receiverId: 2, text: 'Olá! Você pode confirmar a reunião de amanhã?', time: '10:30' },
    { id: 2, senderId: 2, receiverId: 1, text: 'Sim, confirmado! Estarei lá às 14h.', time: '10:32' },
    { id: 3, senderId: 1, receiverId: 3, text: 'Preciso que você revise o documento antes da audiência.', time: '09:15' },
  ];

  get monthName(): string {
    return this.currentDate.toLocaleString('pt-BR', { month: 'long' });
  }

  constructor() {
    this.generateCalendarDays();
    // Inicializa todos os caches
    this.updateWeekCache();
    this.updateDayCache();
    this.updateGroupedTasksCache();
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

  isSameDay(day1: Date, day2: Date): boolean {
    if (!day1 || !day2) return false;
    return day1.getDate() === day2.getDate() &&
           day1.getMonth() === day2.getMonth() &&
           day1.getFullYear() === day2.getFullYear();
  }

  // ======= TAREFAS / DILIGÊNCIAS =======
  formatDateKey(day: Date): string {
    return day.toISOString().slice(0, 10);
  }

  hasTask(day: Date): boolean {
    const dateKey = this.formatDateKey(day);
    return this.filteredTasks().some(task => this.isTaskOnDay(task, day));
  }

  // Verifica se uma task está em um determinado dia (incluindo multi-day)
  isTaskOnDay(task: any, day: Date): boolean {
    const dayStr = this.formatDateKey(day);
    const startDate = task.startDate || task.date;
    const endDate = task.endDate || task.date;
    return dayStr >= startDate && dayStr <= endDate;
  }

  // Verifica se é o primeiro dia de uma task multi-day
  isTaskStart(task: any, day: Date): boolean {
    const dayStr = this.formatDateKey(day);
    return (task.startDate || task.date) === dayStr;
  }

  // Verifica se é o último dia de uma task multi-day
  isTaskEnd(task: any, day: Date): boolean {
    const dayStr = this.formatDateKey(day);
    return (task.endDate || task.date) === dayStr;
  }

  // Verifica se é um dia intermediário de uma task multi-day
  isTaskMiddle(task: any, day: Date): boolean {
    return this.isTaskOnDay(task, day) && !this.isTaskStart(task, day) && !this.isTaskEnd(task, day);
  }

  // Converte cor hex em classe CSS
  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      '#00e7fc': 'color-cyan',
      '#00ff4d': 'color-green',
      '#ff9800': 'color-orange',
      '#ff4757': 'color-red',
      '#a855f7': 'color-purple',
      '#1a73e8': 'color-blue',
      '#34a853': 'color-green',
      '#ea4335': 'color-red',
      '#fbbc04': 'color-yellow',
      'cyan': 'color-cyan',
      'green': 'color-green',
      'orange': 'color-orange',
      'red': 'color-red',
      'purple': 'color-purple',
      'blue': 'color-blue',
      'yellow': 'color-yellow',
    };
    return colorMap[color] || 'color-blue';
  }

  // Calcula quantos dias a task ocupa
  getTaskDuration(task: any): number {
    const start = new Date(task.startDate || task.date);
    const end = new Date(task.endDate || task.date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  // Calcula dias restantes até o prazo
  getDaysUntilDeadline(task: any): number {
    if (!task.deadline) return -1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Formata dias para exibição
  formatDaysRemaining(days: number): string {
    if (days < 0) return 'Vencido';
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    return `${days} dias`;
  }

  getTasksForDay(day: Date) {
    return this.filteredTasks().filter(task => this.isTaskOnDay(task, day));
  }

  // Retorna tasks que começam neste dia (para exibição no calendário mensal)
  getTasksStartingOnDay(day: Date) {
    const dayStr = this.formatDateKey(day);
    return this.filteredTasks().filter(task => (task.startDate || task.date) === dayStr);
  }

  selectDay(day: Date) {
    this.selectedDay = day;
    // Atualiza os caches para a nova data
    this.updateViewCaches();
    // Se houver tarefas, seleciona a primeira no painel
    const tasks = this.getTasksForDay(day);
    this.selectedTask = tasks[0] || null;
    this.isCreatingTask = false;
  }

  // Calcula posição do popup flutuante - centralizado na tela
  calculatePopupPosition(event: MouseEvent) {
    const windowWidth = window.innerWidth;
    const popupWidth = 1100;

    // Centraliza o popup horizontalmente e posiciona no topo
    this.popupPosition.left = Math.max(20, (windowWidth - popupWidth) / 2);
    // Posiciona a 30px do topo
    this.popupPosition.top = 30;
  }

  // Abre popup lateral para criar nova diligência ao clicar no dia
  openNewTaskPopup(day: Date, event?: MouseEvent) {
    // Previne propagação e comportamento padrão
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    // Força abertura imediata
    setTimeout(() => {
      this.selectedDay = day;
      const baseDate = this.formatDateKey(day);
      const today = this.formatDateKey(new Date());

      this.isEditingTask = false;
      this.editingTaskId = null;
      this.newNoteText = '';
      this.newTask = {
        title: '',
        startDate: baseDate,
        endDate: baseDate,
        date: baseDate,
        time: '09:00',
        deadline: '',
        createdAt: today,
        description: '',
        status: 'Pendente',
        urgency: 'Média',
        color: '#00e7fc',
        isMultiDay: false,
        location: '',
        linkedProcess: '',
        reminder: '',
        tags: [],
        attendees: [],
        attachments: [],
        checklist: [],
        notes: [],
      };

      this.isPopupOpen = true;
    }, 0);
  }

  // Abre popup lateral para editar uma tarefa existente
  openEditTaskPopup(task: any, event?: MouseEvent) {
    // Previne propagação e comportamento padrão
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    // Força abertura imediata
    setTimeout(() => {
      this.isEditingTask = true;
      this.editingTaskId = task.id;
      this.selectedDay = new Date(task.startDate || task.date);
      this.newNoteText = '';

      this.newTask = {
        title: task.title,
        startDate: task.startDate || task.date,
        endDate: task.endDate || task.date,
        date: task.date,
        time: task.time,
        deadline: task.deadline || '',
        createdAt: task.createdAt || '',
        description: task.description || '',
        status: task.status,
        urgency: task.urgency,
        color: task.color,
        isMultiDay: task.isMultiDay || false,
        location: task.location || '',
        linkedProcess: task.linkedProcess || '',
        reminder: task.reminder || '',
        tags: task.tags ? [...task.tags] : [],
        attendees: task.attendees ? [...task.attendees] : [],
        attachments: task.attachments ? [...task.attachments] : [],
        checklist: task.checklist ? [...task.checklist] : [],
        notes: task.notes ? [...task.notes] : [],
      };

      this.isPopupOpen = true;
    }, 0);
  }

  closePopup() {
    this.isPopupOpen = false;
    this.isEditingTask = false;
    this.editingTaskId = null;
  }

  // Atualiza isMultiDay baseado nas datas
  onDateChange() {
    if (this.newTask.startDate && this.newTask.endDate) {
      this.newTask.isMultiDay = this.newTask.startDate !== this.newTask.endDate;
      this.newTask.date = this.newTask.startDate;
    }
  }

  saveTaskFromPopup() {
    if (!this.newTask.title || !this.newTask.startDate || !this.newTask.time) return;

    // Garantir que endDate existe
    if (!this.newTask.endDate) {
      this.newTask.endDate = this.newTask.startDate;
    }

    if (this.isEditingTask && this.editingTaskId) {
      // Atualizar task existente
      const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          title: this.newTask.title,
          startDate: this.newTask.startDate,
          endDate: this.newTask.endDate,
          date: this.newTask.startDate,
          time: this.newTask.time,
          deadline: this.newTask.deadline,
          description: this.newTask.description,
          status: this.newTask.status,
          urgency: this.newTask.urgency,
          color: this.newTask.color,
          isMultiDay: this.newTask.startDate !== this.newTask.endDate,
        };
        this.showNotification('Diligência atualizada com sucesso!');
      }
    } else {
      // Criar nova task
      this.tasks.push({
        id: this.tasks.length + 1,
        userId: this.selectedUser.id,
        title: this.newTask.title,
        startDate: this.newTask.startDate,
        endDate: this.newTask.endDate,
        date: this.newTask.startDate,
        time: this.newTask.time,
        deadline: this.newTask.deadline,
        createdAt: this.newTask.createdAt,
        description: this.newTask.description,
        status: this.newTask.status,
        urgency: this.newTask.urgency,
        color: this.newTask.color,
        isMultiDay: this.newTask.startDate !== this.newTask.endDate,
      });
      this.showNotification('Diligência criada com sucesso!');
    }

    // Atualiza caches após salvar
    this.updateViewCaches();
    this.closePopup();
  }

  // Deletar task
  deleteTask(task: any) {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.showNotification('Diligência removida!');
      // Atualiza caches após deletar
      this.updateViewCaches();
      this.closePopup();
      this.closeSidePanel();
    }
  }

  // Deletar task do popup
  deleteTaskFromPopup() {
    if (this.editingTaskId) {
      const index = this.tasks.findIndex(t => t.id === this.editingTaskId);
      if (index !== -1) {
        this.tasks.splice(index, 1);
        this.showNotification('Diligência removida!');
        // Atualiza caches após deletar
        this.updateViewCaches();
        this.closePopup();
      }
    }
  }

  // ===== MÉTODOS PARA POPUP AVANÇADO =====

  // Checklist

  addChecklistItem() {
    if (this.newChecklistItem.trim()) {
      this.newTask.checklist.push({
        id: Date.now(),
        text: this.newChecklistItem.trim(),
        completed: false
      });
      this.newChecklistItem = '';
    }
  }

  removeChecklistItem(item: any) {
    const index = this.newTask.checklist.findIndex((i: any) => i.id === item.id);
    if (index !== -1) {
      this.newTask.checklist.splice(index, 1);
    }
  }

  toggleChecklistItem(item: any) {
    item.completed = !item.completed;
  }

  getChecklistProgress(): number {
    if (this.newTask.checklist.length === 0) return 0;
    const completed = this.newTask.checklist.filter((i: any) => i.completed).length;
    return Math.round((completed / this.newTask.checklist.length) * 100);
  }

  // Tags
  newTag = '';
  availableTags = ['Urgente', 'Em análise', 'Documentação', 'Audiência', 'Prazo', 'Cliente VIP', 'Contrato', 'Recurso'];

  addTag() {
    if (this.newTag.trim() && !this.newTask.tags.includes(this.newTag.trim())) {
      this.newTask.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  addTagFromList(tag: string) {
    if (!this.newTask.tags.includes(tag)) {
      this.newTask.tags.push(tag);
    }
  }

  removeTag(tag: string) {
    const index = this.newTask.tags.indexOf(tag);
    if (index !== -1) {
      this.newTask.tags.splice(index, 1);
    }
  }

  // Attendees
  newAttendee = '';
  availableAttendees = [
    { id: 1, name: 'Matheus Vital', email: 'matheus@advocacia.com', avatar: 'M' },
    { id: 2, name: 'Daniel Mathias', email: 'daniel@advocacia.com', avatar: 'D' },
    { id: 3, name: 'Wilker', email: 'wilker@advocacia.com', avatar: 'W' },
    { id: 4, name: 'Gabriel Castro', email: 'gabriel@advocacia.com', avatar: 'G' },
  ];

  addAttendee() {
    if (this.newAttendee.trim()) {
      const attendee = this.availableAttendees.find(a =>
        a.name.toLowerCase().includes(this.newAttendee.toLowerCase()) ||
        a.email.toLowerCase().includes(this.newAttendee.toLowerCase())
      );
      if (attendee && !this.newTask.attendees.find((a: any) => a.id === attendee.id)) {
        this.newTask.attendees.push(attendee);
      }
      this.newAttendee = '';
    }
  }

  addAttendeeFromList(attendee: any) {
    if (!this.newTask.attendees.find((a: any) => a.id === attendee.id)) {
      this.newTask.attendees.push(attendee);
    }
  }

  removeAttendee(attendee: any) {
    const index = this.newTask.attendees.findIndex((a: any) => a.id === attendee.id);
    if (index !== -1) {
      this.newTask.attendees.splice(index, 1);
    }
  }

  // Attachments
  attachmentInput: any;

  triggerFileUpload() {
    // Este método seria acionado pelo botão de upload
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.jpg,.png,.xls,.xlsx';
    input.onchange = (event: any) => {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        this.newTask.attachments.push({
          id: Date.now() + i,
          name: files[i].name,
          size: this.formatFileSize(files[i].size),
          type: files[i].type.split('/')[1] || 'file'
        });
      }
    };
    input.click();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  removeAttachment(attachment: any) {
    const index = this.newTask.attachments.findIndex((a: any) => a.id === attachment.id);
    if (index !== -1) {
      this.newTask.attachments.splice(index, 1);
    }
  }

  // Notas / Comunicação (estilo chat/email)
  addNote() {
    if (!this.newNoteText.trim()) return;

    const now = new Date();
    const note = {
      id: Date.now(),
      author: this.selectedUser?.name || 'Usuário',
      avatar: this.selectedUser?.avatar || 'U',
      text: this.newNoteText.trim(),
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    if (!this.newTask.notes) {
      this.newTask.notes = [];
    }
    this.newTask.notes.push(note);
    this.newNoteText = '';
  }

  removeNote(note: any) {
    const index = this.newTask.notes.findIndex((n: any) => n.id === note.id);
    if (index !== -1) {
      this.newTask.notes.splice(index, 1);
    }
  }

  // Formatação de texto (markdown básico)
  formatNote(type: string) {
    const textarea = document.querySelector('.composer-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.newNoteText.substring(start, end);

    let formattedText = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'texto'}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'texto'}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'link':
        formattedText = `[${selectedText || 'texto'}](url)`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'item'}`;
        cursorOffset = 3;
        break;
      case 'heading':
        formattedText = `\n# ${selectedText || 'Título'}`;
        cursorOffset = 3;
        break;
      default:
        return;
    }

    this.newNoteText =
      this.newNoteText.substring(0, start) +
      formattedText +
      this.newNoteText.substring(end);

    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      const newPos = start + formattedText.length - cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  // Processos vinculados
  availableProcesses = [
    { number: '0012345-67.2024.8.26.0100', name: 'Silva vs. Oliveira - Trabalhista' },
    { number: '0098765-43.2024.8.26.0100', name: 'Santos vs. Empresa ABC - Cível' },
    { number: '0054321-12.2024.8.26.0100', name: 'Costa - Inventário' },
  ];

  // Abas do popup
  activePopupTab: 'details' | 'checklist' | 'attachments' | 'activity' = 'details';

  setPopupTab(tab: 'details' | 'checklist' | 'attachments' | 'activity') {
    this.activePopupTab = tab;
  }

  // Métodos auxiliares para template
  isAttendeeAdded(attendee: any): boolean {
    return this.newTask.attendees.some((a: any) => a.id === attendee.id);
  }

  getCompletedChecklistCount(): number {
    return this.newTask.checklist.filter((i: any) => i.completed).length;
  }

  // Seleção múltipla de usuários
  isUserSelected(user: any): boolean {
    return this.selectedUsers.includes(user.id);
  }

  toggleUserSelection(user: any) {
    const index = this.selectedUsers.indexOf(user.id);
    if (index === -1) {
      this.selectedUsers.push(user.id);
    } else {
      this.selectedUsers.splice(index, 1);
    }
    // Atualiza selectedUser para o primeiro selecionado ou o primeiro da lista
    if (this.selectedUsers.length > 0) {
      this.selectedUser = this.users.find(u => u.id === this.selectedUsers[0]) || this.users[0];
    }
    this.selectedTask = null;
    this.updateGroupedTasksCache();
  }

  toggleSelectAllUsers() {
    if (this.areAllUsersSelected()) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = this.users.map(u => u.id);
    }
    if (this.selectedUsers.length > 0) {
      this.selectedUser = this.users.find(u => u.id === this.selectedUsers[0]) || this.users[0];
    }
    this.updateGroupedTasksCache();
  }

  areAllUsersSelected(): boolean {
    return this.selectedUsers.length === this.users.length;
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.selectedTask = null;
  }

  selectTask(task: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.selectedTask = task;
    this.isCreatingTask = false;
    this.isSidePanelOpen = true;
  }

  startCreateTask() {
    this.isCreatingTask = true;
    this.selectedTask = null;
    this.isSidePanelOpen = true;
    const baseDate = this.selectedDay ? this.formatDateKey(this.selectedDay) : this.formatDateKey(new Date());
    const today = this.formatDateKey(new Date());
    this.newTask = {
      title: '',
      startDate: baseDate,
      endDate: baseDate,
      date: baseDate,
      time: '09:00',
      deadline: '',
      createdAt: today,
      description: '',
      status: 'Pendente',
      urgency: 'Média',
      color: 'cyan',
    };
  }

  closeSidePanel() {
    this.isSidePanelOpen = false;
    this.selectedTask = null;
    this.isCreatingTask = false;
  }

  // Filtros combináveis
  filteredTasks() {
    return this.tasks.filter(task => {
      // Se nenhum usuário selecionado, mostra todas as tarefas
      // Se há usuários selecionados, filtra por eles
      const matchesUser = this.selectedUsers.length === 0
        ? true
        : this.selectedUsers.includes(task.userId);
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
    if (!this.newTask.title || !this.newTask.startDate || !this.newTask.time) return;

    const endDate = this.newTask.endDate || this.newTask.startDate;
    this.tasks.push({
      id: this.tasks.length + 1,
      userId: this.selectedUser.id,
      title: this.newTask.title,
      startDate: this.newTask.startDate,
      endDate: endDate,
      date: this.newTask.startDate,
      time: this.newTask.time,
      deadline: this.newTask.deadline,
      createdAt: this.formatDateKey(new Date()),
      description: this.newTask.description,
      status: this.newTask.status,
      urgency: this.newTask.urgency,
      color: this.newTask.color,
      isMultiDay: this.newTask.startDate !== endDate,
    });

    this.showNotification('Diligência criada com sucesso!');
    this.isCreatingTask = false;
    this.selectedTask = this.tasks[this.tasks.length - 1];
  }

  // ======= DRAG & DROP AVANÇADO =======
  onTaskDragStart(event: DragEvent, task: any) {
    this.draggedTask = task;
    this.isDragging = true;
    event.dataTransfer?.setData('text/plain', String(task.id));
    event.dataTransfer!.effectAllowed = 'move';

    // Adiciona classe de arrastar ao elemento
    const target = event.target as HTMLElement;
    target.classList.add('dragging');

    // Imagem de arrastar customizada
    if (event.dataTransfer?.setDragImage) {
      const ghost = target.cloneNode(true) as HTMLElement;
      ghost.style.opacity = '0.8';
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      document.body.appendChild(ghost);
      event.dataTransfer.setDragImage(ghost, 10, 10);
      setTimeout(() => document.body.removeChild(ghost), 0);
    }
  }

  onTaskDragEnd(event: DragEvent) {
    this.draggedTask = null;
    this.isDragging = false;
    this.dragOverDay = null;

    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
  }

  onDayDragEnter(event: DragEvent, day: Date) {
    event.preventDefault();
    this.dragOverDay = day;
  }

  onDayDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onDayDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDayDrop(event: DragEvent, day: Date) {
    event.preventDefault();
    this.dragOverDay = null;

    const idStr = event.dataTransfer?.getData('text/plain');
    if (!idStr) return;

    const task = this.tasks.find(t => t.id === Number(idStr));
    if (!task) return;

    const newDateStr = this.formatDateKey(day);
    const oldStartDate = task.startDate || task.date;
    const oldEndDate = task.endDate || task.date;

    // Calcular a diferença de dias para mover o evento inteiro
    const daysDiff = this.getDaysDifference(oldStartDate, newDateStr);

    // Atualizar datas mantendo a duração do evento
    task.startDate = newDateStr;
    task.date = newDateStr;
    task.endDate = this.addDaysToDate(oldEndDate, daysDiff);

    this.showNotification('Diligência movida com sucesso!');
    this.selectedDay = day;
  }

  // Calcula diferença em dias entre duas datas
  getDaysDifference(date1Str: string, date2Str: string): number {
    const d1 = new Date(date1Str);
    const d2 = new Date(date2Str);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Adiciona dias a uma data e retorna string formatada
  addDaysToDate(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return this.formatDateKey(date);
  }

  // ======= RESIZE DE EVENTOS (ESTENDER PARA MÚLTIPLOS DIAS) =======
  onResizeStart(event: MouseEvent, task: any, direction: 'start' | 'end') {
    event.stopPropagation();
    event.preventDefault();
    this.resizingTask = task;
    this.resizeDirection = direction;

    document.addEventListener('mousemove', this.onResizeMove.bind(this));
    document.addEventListener('mouseup', this.onResizeEnd.bind(this));
  }

  onResizeMove(event: MouseEvent) {
    if (!this.resizingTask) return;
    // A lógica de resize é complexa e depende do layout
    // Por simplicidade, faremos resize via clique nos dias
  }

  onResizeEnd(event: MouseEvent) {
    this.resizingTask = null;
    this.resizeDirection = null;
    document.removeEventListener('mousemove', this.onResizeMove.bind(this));
    document.removeEventListener('mouseup', this.onResizeEnd.bind(this));
  }

  // Estender task até um dia específico
  extendTaskToDay(task: any, day: Date) {
    const newDateStr = this.formatDateKey(day);
    const startDate = task.startDate || task.date;

    // Se o novo dia é antes do início, ajustar o início
    if (newDateStr < startDate) {
      task.startDate = newDateStr;
      task.date = newDateStr;
    } else {
      // Estender o final
      task.endDate = newDateStr;
    }

    task.isMultiDay = task.startDate !== task.endDate;
    this.showNotification('Duração alterada!');
  }

  // Verificar se um dia está sendo arrastado sobre
  isDragOver(day: Date): boolean {
    if (!this.dragOverDay) return false;
    return this.isSameDay(day, this.dragOverDay);
  }

  // ======= VIEWS (MÊS / SEMANA / DIA / LISTA) =======
  setCalendarView(view: 'month' | 'week' | 'day' | 'list') {
    this.calendarView = view;
    this.updateViewCaches();
  }

  // Atualiza todos os caches conforme a view atual
  updateViewCaches() {
    if (this.calendarView === 'list') {
      this.updateGroupedTasksCache();
    } else if (this.calendarView === 'week') {
      this.updateWeekCache();
    } else if (this.calendarView === 'day') {
      this.updateDayCache();
    }
  }

  // Cache para semana
  updateWeekCache() {
    const base = this.selectedDay || new Date();
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    this.weekDaysCache = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    // Pré-calcula tasks de cada dia da semana
    this.weekTasksCache.clear();
    for (const day of this.weekDaysCache) {
      const key = this.formatDateKey(day);
      this.weekTasksCache.set(key, this.getTasksForDay(day));
    }
  }

  // Obtém tasks do cache da semana
  getWeekDayTasks(day: Date): any[] {
    const key = this.formatDateKey(day);
    return this.weekTasksCache.get(key) || [];
  }

  // Cache para dia
  updateDayCache() {
    if (this.selectedDay) {
      this.dayTasksCache = this.getTasksForDay(this.selectedDay);
      this.dayAllDayTasksCache = this.dayTasksCache.filter(task => !task.time || task.isMultiDay || task.time === 'All day');
      this.dayTimedTasksCache = this.dayTasksCache.filter(task => task.time && !task.isMultiDay && task.time !== 'All day');
    } else {
      this.dayTasksCache = [];
      this.dayAllDayTasksCache = [];
      this.dayTimedTasksCache = [];
    }
  }

  getWeekDays(): Date[] {
    if (this.weekDaysCache.length === 0) {
      this.updateWeekCache();
    }
    return this.weekDaysCache;
  }

  // TrackBy para dias (arrow function para manter contexto do this)
  trackByDay = (index: number, day: Date): string => {
    return day.toISOString().split('T')[0];
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

  // ======= TIMELINE E EVENTOS =======
  getEventTopPosition(timeStr: string): number {
    // Converte horário (ex: "09:00" ou "9 AM") para posição percentual
    const hour = this.parseTimeToHour(timeStr);
    // 9 AM = 0%, 5 PM = 100% (8 horas de trabalho)
    const startHour = 9;
    const endHour = 17;
    const totalHours = endHour - startHour;
    const position = ((hour - startHour) / totalHours) * 100;
    return Math.max(0, Math.min(100, position));
  }

  getEventHeight(startTime: string, durationMinutes: number | undefined | null): number {
    const duration = durationMinutes || 60;
    const totalMinutes = 8 * 60; // 8 horas em minutos
    return (duration / totalMinutes) * 100;
  }

  getEventHeightPx(task: any): number {
    const duration = (task as any).duration || 60;
    // Cada hora = 60px, então cada minuto = 1px
    return Math.max(30, duration);
  }

  getAllDayTasks(day: Date): any[] {
    // Retorna tasks multi-dia ou sem horário específico
    const tasks = this.getTasksForDay(day);
    return tasks.filter(task => !task.time || task.isMultiDay || task.time === 'All day');
  }

  getTimedTasks(day: Date): any[] {
    // Retorna tasks com horário específico
    const tasks = this.getTasksForDay(day);
    return tasks.filter(task => task.time && !task.isMultiDay && task.time !== 'All day');
  }

  getTaskDurationMinutes(task: any): number {
    return (task as any).duration || 60;
  }

  parseTimeToHour(timeStr: string): number {
    // Suporta formatos "09:00", "9:00", "9 AM", "10 AM", "1 PM", etc.
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const parts = timeStr.trim().split(' ');
      let hour = parseInt(parts[0]);
      const period = parts[1];
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return hour;
    }
    // Formato 24h "09:00"
    const [hours] = timeStr.split(':');
    return parseInt(hours) || 9;
  }

  // ======= CHAT =======
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  selectChatUser(user: any) {
    this.selectedChatUser = user;
    // Marcar mensagens como lidas
    this.markMessagesAsRead(user.id);
  }

  getChatMessages(userId: number): any[] {
    return this.chatMessages.filter(
      msg =>
        (msg.senderId === this.currentUserId && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === this.currentUserId)
    ).sort((a, b) => {
      // Ordenar por tempo (simplificado)
      return a.id - b.id;
    });
  }

  sendChatMessage() {
    if (!this.chatMessageInput.trim() || !this.selectedChatUser) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.chatMessages.push({
      id: this.chatMessages.length + 1,
      senderId: this.currentUserId,
      receiverId: this.selectedChatUser.id,
      text: this.chatMessageInput.trim(),
      time: timeStr,
      read: false,
    });

    this.chatMessageInput = '';

    // Scroll para a última mensagem
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  getUnreadCount(userId: number): number {
    return this.chatMessages.filter(
      msg => msg.receiverId === this.currentUserId &&
             msg.senderId === userId &&
             !msg.read
    ).length;
  }

  getTotalUnreadCount(): number {
    return this.chatMessages.filter(
      msg => msg.receiverId === this.currentUserId && !msg.read
    ).length;
  }

  markMessagesAsRead(userId: number) {
    this.chatMessages.forEach(msg => {
      if (msg.senderId === userId && msg.receiverId === this.currentUserId) {
        msg.read = true;
      }
    });
  }

  // ======= VISUALIZAÇÃO DE LISTA =======
  getGroupedTasks(): any[] {
    const tasks = this.filteredTasks();
    const grouped: { [key: string]: { date: Date; tasks: any[] } } = {};

    // Agrupar por data
    tasks.forEach(task => {
      const dateKey = task.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: new Date(dateKey),
          tasks: []
        };
      }
      grouped[dateKey].tasks.push(task);
    });

    // Converter para array e ordenar
    const groups = Object.values(grouped);

    // Ordenar grupos por data
    groups.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Ordenar tarefas dentro de cada grupo
    groups.forEach(group => {
      group.tasks.sort((a, b) => {
        switch (this.listSortBy) {
          case 'time':
            return this.compareTime(a.time, b.time);
          case 'urgency':
            const urgencyOrder = { 'Alta': 3, 'Média': 2, 'Leve': 1 };
            return (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0) -
                   (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0);
          case 'status':
            return a.status.localeCompare(b.status);
          case 'date':
          default:
            return this.compareTime(a.time, b.time);
        }
      });
    });

    return groups;
  }

  // TrackBy functions para otimização (arrow functions para manter contexto)
  trackByDate = (index: number, group: any): string => {
    return group.date?.toISOString() || index.toString();
  }

  trackByTaskId = (index: number, task: any): number => {
    return task.id;
  }

  // Atualiza o cache da lista agrupada
  updateGroupedTasksCache() {
    this.groupedTasksCache = this.getGroupedTasks();
  }

  compareTime(timeA: string, timeB: string): number {
    const hourA = this.parseTimeToHour(timeA);
    const minuteA = this.parseTimeToMinutes(timeA);
    const hourB = this.parseTimeToHour(timeB);
    const minuteB = this.parseTimeToMinutes(timeB);

    if (hourA !== hourB) {
      return hourA - hourB;
    }
    return minuteA - minuteB;
  }

  parseTimeToMinutes(timeStr: string): number {
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const parts = timeStr.trim().split(' ');
      const timePart = parts[0];
      const [hours, minutes = '0'] = timePart.split(':');
      return parseInt(minutes) || 0;
    }
    const [hours, minutes = '0'] = timeStr.split(':');
    return parseInt(minutes) || 0;
  }

  sortTasks() {
    // O método getGroupedTasks já faz a ordenação, então apenas forçamos a atualização
    // A mudança no listSortBy já dispara a atualização automática
  }

  getUserInitials(userId: number | undefined | null): string {
    if (!userId) return '';
    const user = this.users.find(u => u.id === userId);
    if (!user) return '';
    return user.avatar || user.name.charAt(0).toUpperCase();
  }

  getUserColor(userId: number): string {
    const colors = ['#00e7fc', '#00ff4d', '#ff9800', '#ff4757', '#a855f7'];
    return colors[(userId - 1) % colors.length];
  }

  getWeekNumber(): number {
    const date = this.selectedDay || new Date();
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
