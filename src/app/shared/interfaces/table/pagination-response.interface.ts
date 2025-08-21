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