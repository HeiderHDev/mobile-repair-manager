import { UserRole } from "../../enum/auth/user-role.enum";

export interface User {
    id: string;
    username: string;
    email?: string;
    fullName?: string;
    role: UserRole;
    isActive: boolean;
}