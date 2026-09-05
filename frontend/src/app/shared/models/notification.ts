export type NotificationType = 'error' | 'success' | 'warning' | 'info';

export interface NotificationModel {
  readonly messageKey: string;
  readonly type: NotificationType;
}
