import { UserRole } from "@core/enum/auth/user-role.enum";

export interface UpdateUserRequest {
    id: string;
    username?: string;
    email?: string;
    fullName?: string;
    role?: UserRole;
    isActive?: boolean;
}