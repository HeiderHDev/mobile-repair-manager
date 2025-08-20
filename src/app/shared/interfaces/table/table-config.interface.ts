import { TableAction } from "./table-action.interface";
import { TableColumn } from "./table-column.interface";

export interface TableConfig<T = unknown> {
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    showAddButton?: boolean;
    addButtonLabel?: string;
    onAdd?: () => void;
    showSearch?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    title?: string;
    paginator?: boolean;
    rows?: number;
    rowsPerPageOptions?: number[];
}