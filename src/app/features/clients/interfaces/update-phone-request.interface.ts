import { CreatePhoneRequest } from "./create-phone-request.interface";

export interface UpdatePhoneRequest extends Partial<CreatePhoneRequest> {
    id: string;
    isActive?: boolean;
}