import { DocumentType } from "../enum/document-type.enum";

export interface CreateClientRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    documentType: DocumentType;
    documentNumber: string;
    notes?: string;
}