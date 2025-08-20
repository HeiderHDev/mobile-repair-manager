import { User } from "./user.interface";

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}