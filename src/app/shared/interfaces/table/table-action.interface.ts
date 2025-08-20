export interface TableAction<T = unknown> {
    label: string;
    icon: string;
    action: (item: T) => void;
    disabled?: (item: T) => boolean;
    visible?: (item: T) => boolean;
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'danger';
}