import { TemplateRef } from "@angular/core";

export interface TableColumn<T = unknown> {
    field: keyof T;
    header: string;
    type?: 'text' | 'date' | 'boolean' | 'template';
    sortable?: boolean;
    template?: TemplateRef<{ $implicit: T; rowIndex: number }>;
    width?: string;
}