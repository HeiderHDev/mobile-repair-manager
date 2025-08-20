import { DocumentType } from "../enum/document-type.enum";

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    documentType: DocumentType;
    documentNumber: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    notes?: string;
}