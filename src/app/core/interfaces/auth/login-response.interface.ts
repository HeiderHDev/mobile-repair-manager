import { User } from "./user.interface";

export interface LoginResponse {
    token: string;
    user: User;
    expiresIn: number;
}