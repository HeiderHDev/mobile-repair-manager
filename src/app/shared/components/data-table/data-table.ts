import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseEntity } from '@shared/interfaces/table/base-entity.interface';
import { TableAction } from '@shared/interfaces/table/table-action.interface';
import { TableConfig } from '@shared/interfaces/table/table-config.interface';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  next: string | null;
  prev: string | null;
  customers?: T[];
  repairs?: T[];
  items?: T[];
  data?: T[];
}

@Component({
  selector: 'app-data-table',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './data-table.html',
  styles: [`
    :host ::ng-deep .p-button-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.75rem;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      padding: 0.75rem;
      font-weight: 600;
    }

    :host ::ng-deep .action-buttons {
      @apply flex gap-1 justify-center;
    }

    :host ::ng-deep .p-button.p-button-sm {
      @apply px-2 py-1 text-xs font-medium rounded-md transition-all duration-200;
    }

    :host ::ng-deep .p-button-primary {
      @apply bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700;
    }

    :host ::ng-deep .p-button-info {
      @apply bg-cyan-600 hover:bg-cyan-700 border-cyan-600 hover:border-cyan-700;
    }

    :host ::ng-deep .p-button-success {
      @apply bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700;
    }

    :host ::ng-deep .p-button-warning {
      @apply bg-amber-600 hover:bg-amber-700 border-amber-600 hover:border-amber-700;
    }

    :host ::ng-deep .p-button-danger {
      @apply bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700;
    }

    :host ::ng-deep .p-button-secondary {
      @apply bg-gray-600 hover:bg-gray-700 border-gray-600 hover:border-gray-700;
    }

    :host ::ng-deep .p-button:disabled {
      @apply opacity-50 cursor-not-allowed;
    }

    :host ::ng-deep .p-button:not(:disabled):hover {
      @apply shadow-md transform scale-105;
    }

    :host ::ng-deep .p-button:focus {
      @apply ring-2 ring-offset-2 ring-blue-500;
    }
  `]
})
export class DataTable<T extends BaseEntity> implements OnDestroy {
  readonly data = input.required<T[] | PaginatedResponse<T>>();
  readonly config = input.required<TableConfig<T>>();
  readonly loading = input<boolean>(false);

  readonly actionExecuted = output<{ action: string; item: T }>();
  readonly pageChanged = output<{ page: number; limit: number }>();

  searchControl = new FormControl('');
  private readonly searchValue = signal('');
  private readonly destroy$ = new Subject<void>();

  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Signals para manejo de paginación
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  // Computed para extraer datos del input
  readonly tableData = computed(() => {
    const inputData = this.data();
    return this.extractDataArray(inputData);
  });

  // Computed para información de paginación
  readonly paginationInfo = computed(() => {
    const inputData = this.data();
    if (this.isPaginatedResponse(inputData)) {
      return {
        total: inputData.total,
        page: inputData.page,
        limit: inputData.limit,
        hasNext: !!inputData.next,
        hasPrev: !!inputData.prev
      };
    }
    return null;
  });

  // Computed para filtrado local (solo si no es paginación del servidor)
  readonly filteredData = computed(() => {
    const searchTerm = this.searchValue().toLowerCase().trim();
    const data = this.tableData();
    
    if (!searchTerm || this.isServerSidePagination()) {
      return data;
    }

    return data.filter(item =>
      this.config().columns.some(column => {
        const value = item[column.field];
        return value?.toString().toLowerCase().includes(searchTerm);
      })
    );
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchValue.set(value || '');
        // Si es paginación del servidor, emitir evento para nueva búsqueda
        if (this.isServerSidePagination()) {
          this.onPageChange({ first: 0, rows: this.pageSize() });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos para determinar el tipo de datos
  private isPaginatedResponse(data: T[] | PaginatedResponse<T>): data is PaginatedResponse<T> {
    return data && typeof data === 'object' && 
           'page' in data && 'limit' in data && 'total' in data;
  }

  private extractDataArray(data: T[] | PaginatedResponse<T>): T[] {
    if (!data) return [];
    
    if (Array.isArray(data)) return data;
    
    if (this.isPaginatedResponse(data)) {
      return data.customers || data.repairs || data.items || data.data || [];
    }
    
    return [];
  }

  // Eventos de paginación
  onPageChange(event: TablePageEvent): void {
    const page = (event.first / event.rows) + 1; // Convertir first/rows a página 1-based
    this.currentPage.set(page);
    this.pageSize.set(event.rows);
    
    if (this.isServerSidePagination()) {
      this.pageChanged.emit({ 
        page: page, 
        limit: event.rows 
      });
    }
  }

  handleAdd(): void {
    const onAdd = this.config().onAdd;
    if (onAdd) {
      onAdd();
    }
  }

  executeAction(action: TableAction<T>, item: T): void {
    if (action.label.toLowerCase().includes('eliminar') || action.label.toLowerCase().includes('delete')) {
      this.confirmationService.confirm({
        message: `¿Estás seguro de que deseas eliminar este elemento?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-sm',
        accept: () => {
          action.action(item);
          this.actionExecuted.emit({ action: action.label, item });
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Elemento eliminado correctamente'
          });
        }
      });
    } else {
      action.action(item);
      this.actionExecuted.emit({ action: action.label, item });
    }
  }

  hasActions(): boolean {
    return (this.config().actions?.length || 0) > 0;
  }

  getVisibleActions(item: T): TableAction<T>[] {
    return this.config().actions?.filter(action =>
      action.visible ? action.visible(item) : true
    ) || [];
  }

  getTotalColumns(): number {
    const columnsCount = this.config().columns.length;
    const actionsCount = this.hasActions() ? 1 : 0;
    return columnsCount + actionsCount;
  }

  getSortableField(field: keyof T): string {
    return String(field);
  }

  formatDate(value: string): string {
    if (!value) return '-';
    
    try {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return value.toString();
    }
  }


  isActionDisabled(action: TableAction<T>, item: T): boolean {
    return action.disabled ? action.disabled(item) : false;
  }

  // Computed para campos de filtro global
  readonly globalFilterFields = computed(() => {
    return this.config().columns.map(col => this.getSortableField(col.field));
  });

  // Método para verificar si es paginación del servidor
  isServerSidePagination(): boolean {
    return this.isPaginatedResponse(this.data());
  }

  // Getter para obtener el valor de búsqueda actual
  getSearchValue(): string {
    return this.searchValue();
  }
}