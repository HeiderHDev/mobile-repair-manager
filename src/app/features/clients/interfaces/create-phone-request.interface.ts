import { PhoneCondition } from "../enum/phone-condition.enum";

export interface CreatePhoneRequest {
    clientId: string;
    brand: string;
    model: string;
    imei: string;
    color?: string;
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    condition: PhoneCondition;
    notes?: string;
}