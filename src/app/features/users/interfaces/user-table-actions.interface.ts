import { User } from "./user.interface";

export interface UserTableActions {
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}