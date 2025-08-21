import { UserData } from '@users/services/user-data';
import { User } from '@users/interfaces/user.interface';

interface UserActionCallbacks {
  onEdit: (user: User) => void;
  onRefreshData: () => void;
}

export class UserActionHandler {
  constructor(
    private userService: UserData
  ) {}

  execute(action: string, user: User, callbacks: UserActionCallbacks): void {
    const actionMap = {
      'editar': () => callbacks.onEdit(user),
      'eliminar': () => this.deleteUser(user.id, callbacks.onRefreshData),
      'toggle estado': () => this.toggleUserStatus(user.id, callbacks.onRefreshData)
    };

    const actionHandler = actionMap[action.toLowerCase() as keyof typeof actionMap];
    if (actionHandler) {
      actionHandler();
    }
  }

  private deleteUser(userId: string, onSuccess: () => void): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        onSuccess();
      },
      error: () => {
        onSuccess();
      }
    });
  }

  private toggleUserStatus(userId: string, onSuccess: () => void): void {
    this.userService.toggleUserStatus(userId).subscribe({
      next: () => {
        onSuccess();
      },
      error: () => {
        onSuccess();
      }
    });
  }
}