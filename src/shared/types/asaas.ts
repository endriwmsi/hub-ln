export type AsaasCustomer = {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
};

export type AsaasPayment = {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  dueDate: string;
  status: AsaasPaymentStatus;
  description?: string;
  externalReference?: string;
  pixTransaction?: string;
  invoiceUrl?: string;
};

export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export type AsaasPaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

export type AsaasWebhookEvent =
  | "PAYMENT_CREATED"
  | "PAYMENT_AWAITING_RISK_ANALYSIS"
  | "PAYMENT_APPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_REPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_UPDATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED"
  | "PAYMENT_ANTICIPATED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DELETED"
  | "PAYMENT_RESTORED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_PARTIALLY_REFUNDED"
  | "PAYMENT_REFUND_IN_PROGRESS"
  | "PAYMENT_RECEIVED_IN_CASH_UNDONE"
  | "PAYMENT_CHARGEBACK_REQUESTED"
  | "PAYMENT_CHARGEBACK_DISPUTE"
  | "PAYMENT_AWAITING_CHARGEBACK_REVERSAL"
  | "PAYMENT_DUNNING_RECEIVED"
  | "PAYMENT_DUNNING_REQUESTED"
  | "PAYMENT_BANK_SLIP_VIEWED"
  | "PAYMENT_CHECKOUT_VIEWED";

export type AsaasWebhookPayload = {
  event: AsaasWebhookEvent;
  payment: {
    id: string;
    customer: string;
    billingType: string;
    value: number;
    netValue: number;
    status: AsaasPaymentStatus;
    description?: string;
    externalReference?: string;
    confirmedDate?: string;
    paymentDate?: string;
    clientPaymentDate?: string;
    originalValue?: number;
    interestValue?: number;
    pixTransaction?: string;
  };
};

export type ProcessPaymentResult = {
  success: boolean;
  message: string;
  updatedCount?: number;
  commissionsCreated?: number;
  error?: string;
};
