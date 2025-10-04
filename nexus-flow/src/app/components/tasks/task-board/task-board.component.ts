import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../services/task.service';
import { Task, TaskStatus } from '../../../models';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit {
  private taskService = inject(TaskService);

  public tasks = signal<Task[]>([]);
  public isLoading = signal<boolean>(true);

  public todoTasks = signal<Task[]>([]);
  public inProgressTasks = signal<Task[]>([]);
  public reviewTasks = signal<Task[]>([]);
  public doneTasks = signal<Task[]>([]);

  public showTaskForm = signal<boolean>(false);
  public newTask = signal<Partial<Task>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO'
  });

  public priorityOptions = [
    { value: 'LOW', label: 'Low', class: 'priority-low' },
    { value: 'MEDIUM', label: 'Medium', class: 'priority-medium' },
    { value: 'HIGH', label: 'High', class: 'priority-high' },
    { value: 'URGENT', label: 'Urgent', class: 'priority-urgent' }
  ];

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.organizeTasksByStatus(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
      }
    });
  }

  organizeTasksByStatus(tasks: Task[]): void {
    this.todoTasks.set(tasks.filter(task => task.status === 'TODO'));
    this.inProgressTasks.set(tasks.filter(task => task.status === 'IN_PROGRESS'));
    this.reviewTasks.set(tasks.filter(task => task.status === 'REVIEW'));
    this.doneTasks.set(tasks.filter(task => task.status === 'DONE'));
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      
      const previousData = [...event.previousContainer.data];
      previousData.splice(event.previousIndex, 1);
      
      const newData = [...event.container.data];
      newData.splice(event.currentIndex, 0, { ...task, status: newStatus });
      
      this.updateTaskArrays(event.previousContainer.id, previousData);
      this.updateTaskArrays(event.container.id, newData);
      
      this.updateTaskStatus(task.id, newStatus);
    }
  }

  private updateTaskArrays(containerId: string, data: Task[]): void {
    switch (containerId) {
      case 'todoList':
        this.todoTasks.set(data);
        break;
      case 'inProgressList':
        this.inProgressTasks.set(data);
        break;
      case 'reviewList':
        this.reviewTasks.set(data);
        break;
      case 'doneList':
        this.doneTasks.set(data);
        break;
    }
  }

  updateTaskStatus(taskId: number, status: TaskStatus): void {
    this.taskService.updateTaskStatus(taskId, status).subscribe({
      next: (updatedTask) => {
        this.tasks.update(tasks => 
          tasks.map(task => 
            task.id === taskId ? updatedTask : task
          )
        );
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.loadTasks();
      }
    });
  }

  updateTaskStatusFromTask(task: Task, status: TaskStatus): void {
    this.updateTaskStatus(task.id, status);
  }

  createTask(): void {
    if (this.newTask().title && this.newTask().description) {
      this.taskService.createTask(this.newTask()).subscribe({
        next: (newTask) => {
          this.tasks.update(tasks => [...tasks, newTask]);
          this.organizeTasksByStatus(this.tasks());
          this.resetNewTaskForm();
          this.showTaskForm.set(false);
        },
        error: (error) => {
          console.error('Error creating task:', error);
        }
      });
    }
  }

  resetNewTaskForm(): void {
    this.newTask.set({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO'
    });
  }

  getPriorityClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent',
      'MEDIUM': 'priority-medium',
      'LOW': 'priority-low'
    };
    return priorityClasses[priority] || 'priority-default';
  }

  getDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: Date): boolean {
    return this.getDaysUntilDue(dueDate) < 0;
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks.update(tasks => tasks.filter(task => task.id !== taskId));
          this.organizeTasksByStatus(this.tasks());
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  deleteTaskFromTask(task: Task): void {
    this.deleteTask(task.id);
  }
}