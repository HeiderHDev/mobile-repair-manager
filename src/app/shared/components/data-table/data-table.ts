import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableAction } from '@shared/interfaces/table/table-action.interface';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { BaseEntity } from '@shared/interfaces/table/base-entity.interface';
import { TableConfig } from '@shared/interfaces/table/table-config.interface';

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
    ToastModule
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
    `]
})
export class DataTable<T extends BaseEntity> implements OnInit, OnDestroy {
// Input signals
readonly data = input.required<T[]>();
readonly config = input.required<TableConfig<T>>();

// Output events
readonly actionExecuted = output<{ action: string; item: T }>();

// Internal state
searchControl = new FormControl('');
private readonly searchValue = signal('');
private readonly destroy$ = new Subject<void>();

// Injected services
private readonly confirmationService = inject(ConfirmationService);
private readonly messageService = inject(MessageService);

// Computed properties
readonly filteredData = computed(() => {
  const searchTerm = this.searchValue().toLowerCase().trim();
  if (!searchTerm) return this.data();

  return this.data().filter(item =>
    this.config().columns.some(column => {
      const value = item[column.field];
      return value?.toString().toLowerCase().includes(searchTerm);
    })
  );
});

constructor() {
  // Setup search functionality
  this.searchControl.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    )
    .subscribe(value => {
      this.searchValue.set(value || '');
    });
}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
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
}
