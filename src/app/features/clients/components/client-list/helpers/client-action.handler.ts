import { Router } from '@angular/router';
import { ClientData } from '@clients/services/client-data';
import { Client } from '@clients/interfaces/cliente.interface';

interface ClientActionCallbacks {
  onEdit: (client: Client) => void;
  onRefreshData: () => void;
}

export class ClientActionHandler {
  constructor(
    private clientService: ClientData,
    private router: Router
  ) {}

  execute(action: string, client: Client, callbacks: ClientActionCallbacks): void {
    const actionMap = {
      'editar': () => callbacks.onEdit(client),
      'eliminar': () => this.deleteClient(client.id, callbacks.onRefreshData),
      'ver teléfonos': () => this.navigateToClientPhones(client.id),
      'toggle estado': () => this.toggleClientStatus(client.id, callbacks.onRefreshData)
    };

    const actionHandler = actionMap[action.toLowerCase() as keyof typeof actionMap];
    if (actionHandler) {
      actionHandler();
    }
  }

  private deleteClient(clientId: string, onSuccess: () => void): void {
    this.clientService.deleteClient(clientId).subscribe({
      next: () => {
        onSuccess();
      },
      error: () => {
        onSuccess();
      }
    });
  }

  private toggleClientStatus(clientId: string, onSuccess: () => void): void {
    this.clientService.toggleClientStatus(clientId).subscribe({
      next: () => {
        onSuccess();
      },
      error: () => {
        onSuccess();
      }
    });
  }

  private navigateToClientPhones(clientId: string): void {
    this.router.navigate(['/clients', clientId, 'phones']);
  }
}