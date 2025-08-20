import { Client } from "./cliente.interface";

export interface PaginatedClientsResponse {
    page: number;
    limit: number;
    total: number;
    next: string | null;
    prev: string | null;
    customers: Client[];
}