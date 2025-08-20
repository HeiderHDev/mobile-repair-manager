import { CreateClientRequest } from "./create-client-request.interface";

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
    id: string;
    isActive?: boolean;
}