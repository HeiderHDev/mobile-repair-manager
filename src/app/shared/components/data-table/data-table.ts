import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseEntity } from '@shared/interfaces/table/base-entity.interface';
import { PaginatedResponse } from '@shared/interfaces/table/pagination-response.interface';
import { TableAction } from '@shared/interfaces/table/table-action.interface';
import { TableConfig } from '@shared/interfaces/table/table-config.interface';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

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
    TooltipModule,
    PopoverModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './data-table.html',
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.75rem 0.5rem;
      vertical-align: middle;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      padding: 0.75rem 0.5rem;
      font-weight: 600;
    }

    :host ::ng-deep .actions-column {
      width: 120px;
      min-width: 120px;
      max-width: 120px;
    }

    :host ::ng-deep .actions-container {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }

    :host ::ng-deep .action-button {
      width: 2rem;
      height: 2rem;
      padding: 0;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :host ::ng-deep .actions-overflow {
      position: relative;
    }

    :host ::ng-deep .more-actions-btn {
      width: 2rem;
      height: 2rem;
      padding: 0;
      background: var(--surface-200);
      color: var(--surface-700);
      border: 1px solid var(--surface-300);
    }

    :host ::ng-deep .more-actions-btn:hover {
      background: var(--surface-300);
    }

    :host-context(.dark) ::ng-deep .more-actions-btn {
      background: var(--surface-700);
      color: var(--surface-200);
      border-color: var(--surface-600);
    }

    :host-context(.dark) ::ng-deep .more-actions-btn:hover {
      background: var(--surface-600);
    }

    .search-container {
      position: relative;
      width: 100%;
      max-width: 300px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--surface-500);
      z-index: 2;
    }

    .search-input {
      padding-left: 2.5rem !important;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--surface-300);
      background: var(--surface-0);
      color: var(--surface-900);
    }

    :host-context(.dark) .search-input {
      background: var(--surface-900);
      color: var(--surface-0);
      border-color: var(--surface-600);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 2px rgba(var(--primary-500-rgb), 0.2);
    }

    .pagination-info {
      font-size: 0.875rem;
      color: var(--surface-600);
    }

    :host-context(.dark) .pagination-info {
      color: var(--surface-400);
    }

    .table-responsive {
      overflow-x: auto;
      border-radius: 0.5rem;
      border: 1px solid var(--surface-200);
    }

    :host-context(.dark) .table-responsive {
      border-color: var(--surface-700);
    }

    @media (max-width: 768px) {
      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td,
      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        padding: 0.5rem 0.25rem;
        font-size: 0.875rem;
      }

      :host ::ng-deep .actions-column {
        width: 100px;
        min-width: 100px;
        max-width: 100px;
      }

      :host ::ng-deep .action-button {
        width: 1.75rem;
        height: 1.75rem;
      }

      :host ::ng-deep .more-actions-btn {
        width: 1.75rem;
        height: 1.75rem;
      }
    }
  `]
})
export class DataTable<T extends BaseEntity> implements OnDestroy {
  readonly data = input.required<T[] | PaginatedResponse<T>>();
  readonly config = input.required<TableConfig<T>>();
  readonly loading = input<boolean>(false);

  readonly actionExecuted = output<{ action: string; item: T }>();
  readonly pageChanged = output<{ page: number; limit: number }>();
  readonly searchChanged = output<string>();

  searchControl = new FormControl('');
  private readonly searchValue = signal('');
  private readonly destroy$ = new Subject<void>();

  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly tableData = computed(() => {
    const inputData = this.data();
    return this.extractDataArray(inputData);
  });

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

  readonly displayRange = computed(() => {
    const paginationInfo = this.paginationInfo();
    if (!paginationInfo) {
      const filteredData = this.filteredData();
      return {
        start: filteredData.length > 0 ? 1 : 0,
        end: filteredData.length,
        total: filteredData.length
      };
    }

    const { page, limit, total } = paginationInfo;
    const start = total > 0 ? ((page - 1) * limit) + 1 : 0;
    const end = Math.min(page * limit, total);
    
    return { start, end, total };
  });

  constructor() {
    effect(() => {
      const config = this.config();
      if (config.rows) {
        this.pageSize.set(config.rows);
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        const searchTerm = value?.trim() || '';
        this.searchValue.set(searchTerm);
        
        if (this.isServerSidePagination()) {
          this.searchChanged.emit(searchTerm);
          this.currentPage.set(1);
          this.onPageChange({ first: 0, rows: this.pageSize() });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  onPageChange(event: TablePageEvent): void {
    const page = Math.floor(event.first / event.rows) + 1;
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

  getPrimaryActions(item: T): TableAction<T>[] {
    const actions = this.getVisibleActions(item);
    return actions.slice(0, 2);
  }

  getOverflowActions(item: T): TableAction<T>[] {
    const actions = this.getVisibleActions(item);
    return actions.slice(2);
  }

  hasOverflowActions(item: T): boolean {
    return this.getOverflowActions(item).length > 0;
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

  readonly globalFilterFields = computed(() => {
    return this.config().columns.map(col => this.getSortableField(col.field));
  });

  isServerSidePagination(): boolean {
    return this.isPaginatedResponse(this.data());
  }

  getSearchValue(): string {
    return this.searchValue();
  }

  getPaginationText(): string {
    const range = this.displayRange();
    if (range.total === 0) {
      return 'No hay registros para mostrar';
    }
    return `Mostrando ${range.start} - ${range.end} de ${range.total} registros`;
  }

  hasNextPage(): boolean {
    const paginationInfo = this.paginationInfo();
    return paginationInfo ? paginationInfo.hasNext : false;
  }

  hasPrevPage(): boolean {
    const paginationInfo = this.paginationInfo();
    return paginationInfo ? paginationInfo.hasPrev : false;
  }
}