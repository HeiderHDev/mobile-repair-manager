import { PhoneCondition } from "../enum/phone-condition.enum";
import { Client } from "./cliente.interface";
import { Repair } from "./repair.interface";

export interface Phone {
    id: string;
    clientId: string;
    brand: string;
    model: string;
    imei: string;
    color?: string;
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    condition: PhoneCondition;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    notes?: string;
    client?: Client;
    repairs?: Repair[];
}