import { RepairStatus } from "@clients/enum/repair-status.enum";
import { Client } from "./cliente.interface";
import { Phone } from "./phone.interface";
import { RepairPriority } from "@clients/enum/repair-priority.enum";

export interface Repair {
    id: string;
    phoneId: string;
    clientId: string;
    issue: string;
    description: string;
    status: RepairStatus;
    priority: RepairPriority;
    estimatedCost: number;
    finalCost?: number;
    estimatedDuration: number;
    actualDuration?: number;
    startDate: Date;
    estimatedCompletionDate: Date;
    completionDate?: Date;
    technicianNotes?: string;   
    clientNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    phone?: Phone;
    client?: Client;
}