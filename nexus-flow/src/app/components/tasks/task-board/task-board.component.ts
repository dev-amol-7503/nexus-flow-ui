import { Component, OnInit, signal } from '@angular/core';
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
  public tasks = signal<Task[]>([]);
  public isLoading = signal<boolean>(true);
  public selectedProject = signal<number | null>(null);

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

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    
    // Mock data for demonstration
    setTimeout(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Create login page design',
          description: 'Design modern login page with responsive layout',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          project: { id: 1, name: 'Website Redesign' } as any,
          assignee: { 
            id: 1, 
            firstName: 'You', 
            lastName: 'User' 
          } as any,
          reporter: { 
            id: 2, 
            firstName: 'PM', 
            lastName: 'Manager' 
          } as any,
          tags: ['design', 'ui'],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          title: 'Implement user authentication',
          description: 'Set up JWT-based authentication system',
          status: 'TODO',
          priority: 'MEDIUM',
          project: { id: 1, name: 'Website Redesign' } as any,
          assignee: undefined,
          reporter: { 
            id: 2, 
            firstName: 'PM', 
            lastName: 'Manager' 
          } as any,
          tags: ['backend', 'security'],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          title: 'Database schema design',
          description: 'Design and implement database schema',
          status: 'REVIEW',
          priority: 'HIGH',
          project: { id: 1, name: 'Website Redesign' } as any,
          assignee: { 
            id: 3, 
            firstName: 'Database', 
            lastName: 'Admin' 
          } as any,
          reporter: { 
            id: 2, 
            firstName: 'PM', 
            lastName: 'Manager' 
          } as any,
          tags: ['database', 'backend'],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          title: 'API documentation',
          description: 'Create comprehensive API documentation',
          status: 'DONE',
          priority: 'LOW',
          project: { id: 1, name: 'Website Redesign' } as any,
          assignee: { 
            id: 1, 
            firstName: 'You', 
            lastName: 'User' 
          } as any,
          reporter: { 
            id: 2, 
            firstName: 'PM', 
            lastName: 'Manager' 
          } as any,
          tags: ['documentation', 'api'],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      this.tasks.set(mockTasks);
      this.organizeTasksByStatus(mockTasks);
      this.isLoading.set(false);
    }, 1000);
  }

  organizeTasksByStatus(tasks: Task[]): void {
    this.todoTasks.set(tasks.filter(task => task.status === 'TODO'));
    this.inProgressTasks.set(tasks.filter(task => task.status === 'IN_PROGRESS'));
    this.reviewTasks.set(tasks.filter(task => task.status === 'REVIEW'));
    this.doneTasks.set(tasks.filter(task => task.status === 'DONE'));
  }

  // Drag and drop functionality
  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      // Move within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move to different column - update task status
      const task = event.previousContainer.data[event.previousIndex];
      
      // Remove from previous array
      const previousData = [...event.previousContainer.data];
      previousData.splice(event.previousIndex, 1);
      
      // Add to new array
      const newData = [...event.container.data];
      newData.splice(event.currentIndex, 0, { ...task, status: newStatus });
      
      // Update the signals
      this.updateTaskArrays(event.previousContainer.id, previousData);
      this.updateTaskArrays(event.container.id, newData);
      
      // Update task status in backend
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
    // Update the task in the main tasks array
    this.tasks.update(tasks => 
      tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    );
    
    // Reorganize tasks by status
    this.organizeTasksByStatus(this.tasks());
    
    // Backend Note: Update task status via API
    console.log('Updating task status:', taskId, status);
  }

  // New method for handling task object updates (for dropdown actions)
  updateTaskStatusFromTask(task: Task, status: TaskStatus): void {
    this.updateTaskStatus(task.id, status);
  }

  createTask(): void {
    if (this.newTask().title && this.newTask().description) {
      const newTask: Task = {
        id: Date.now(), // Temporary ID
        title: this.newTask().title!,
        description: this.newTask().description!,
        status: 'TODO',
        priority: this.newTask().priority!,
        project: { id: 1, name: 'Default Project' } as any,
        assignee: undefined,
        reporter: { id: 1, firstName: 'You', lastName: 'User' } as any,
        tags: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.tasks.update(tasks => [...tasks, newTask]);
      this.organizeTasksByStatus(this.tasks());
      this.resetNewTaskForm();
      this.showTaskForm.set(false);
      
      // Backend Note: Create task via API
      console.log('Creating new task:', newTask);
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
      this.tasks.update(tasks => tasks.filter(task => task.id !== taskId));
      this.organizeTasksByStatus(this.tasks());
      
      // Backend Note: Delete task via API
      console.log('Deleting task:', taskId);
    }
  }

  // New method for handling task object deletion (for dropdown actions)
  deleteTaskFromTask(task: Task): void {
    this.deleteTask(task.id);
  }
}