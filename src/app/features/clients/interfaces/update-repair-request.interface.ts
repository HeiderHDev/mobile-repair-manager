import { RepairStatus } from "@clients/enum/repair-status.enum";
import { CreateRepairRequest } from "./create-reapair-request.interface";

export interface UpdateRepairRequest extends Partial<CreateRepairRequest> {
    id: string;
    status?: RepairStatus;
    finalCost?: number;
    actualDuration?: number;
    completionDate?: Date;
}