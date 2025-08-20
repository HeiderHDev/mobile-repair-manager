import { RepairPriority } from "@clients/enum/repair-priority.enum";

export interface CreateRepairRequest {
    phoneId: string;
    issue: string;
    description: string;
    priority: RepairPriority;
    estimatedCost: number;
    estimatedDuration: number;
    technicianNotes?: string;
    clientNotes?: string;
}