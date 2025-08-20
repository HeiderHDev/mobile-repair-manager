export interface ErrorHandlerResponse {
    message: string;
    status: number;
    statusText: string;
    url?: string;
    timestamp?: Date;
  }
  
  export interface NotificationConfig {
    severity: 'success' | 'info' | 'warn' | 'error';
    summary: string;
    detail: string;
    life?: number;
    sticky?: boolean;
  }