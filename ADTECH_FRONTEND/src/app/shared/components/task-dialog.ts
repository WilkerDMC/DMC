import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface TaskDialogData {
  task?: any;
  users: any[];
  date?: Date;
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatTooltipModule
  ],
  templateUrl: './task-dialog.html',
  styleUrls: ['./task-dialog.scss']
})
export class TaskDialog implements OnInit {
  taskForm: FormGroup;
  statusList = ['Pendente', 'Em andamento', 'Concluída', 'Cancelada'];
  urgencyList = ['Leve', 'Média', 'Alta'];
  colorOptions = [
    { key: 'cyan', name: 'Azul', value: '#00bcd4' },
    { key: 'green', name: 'Verde', value: '#4caf50' },
    { key: 'orange', name: 'Laranja', value: '#ff9800' },
    { key: 'red', name: 'Vermelho', value: '#f44336' },
    { key: 'purple', name: 'Roxo', value: '#9c27b0' }
  ];
  users: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {
    this.taskForm = this.fb.group({
      id: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      date: [null, Validators.required],
      time: ['09:00', Validators.required],
      status: ['Pendente', Validators.required],
      urgency: ['Média', Validators.required],
      userId: [null, Validators.required],
      color: ['cyan', Validators.required]
    });
  }

  ngOnInit(): void {
    // Inicializa a lista de usuários a partir dos dados de entrada
    this.users = this.data.users || [];

    if (this.data && this.data.task) {
      // Preencher o formulário com os dados da tarefa existente
      const task = this.data.task;
      this.taskForm.patchValue({
        id: task.id,
        title: task.title,
        description: task.description || '',
        date: new Date(task.date),
        time: task.time || '09:00',
        status: task.status || 'Pendente',
        urgency: task.urgency || 'Média',
        userId: task.userId || null,
        color: task.color || 'cyan'
      });
    } else if (this.data && this.data.date) {
      // Definir a data para uma nova tarefa
      this.taskForm.patchValue({
        date: this.data.date
      });
    }

    // Definir o primeiro usuário como padrão se não houver usuário selecionado
    if (this.users.length > 0 && !this.taskForm.get('userId')?.value) {
      this.taskForm.patchValue({
        userId: this.users[0].id
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;

      // Formatar a data para o formato YYYY-MM-DD
      const formattedDate = this.formatDate(formValue.date);

      const result = {
        ...formValue,
        date: formattedDate
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  selectColor(color: string): void {
    this.taskForm.patchValue({ color });
  }

  getUserColor(userId: number): string {
    const colors = ['#00bcd4', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#3f51b5'];
    return colors[userId % colors.length];
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
