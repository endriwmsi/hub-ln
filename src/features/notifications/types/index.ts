export type NotificationType =
  | "withdrawal_request"
  | "withdrawal_approved"
  | "withdrawal_paid"
  | "withdrawal_rejected"
  | "commission_received"
  | "system";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  relatedId?: string | null;
  read: boolean;
  createdAt: Date;
  readAt?: Date | null;
};
