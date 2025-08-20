import { UserRole } from "@core/enum/auth/user-role.enum";

export interface CreateUserRequest {
    username: string;
    email: string;
    fullName: string;
    password: string;
    role: UserRole;
}