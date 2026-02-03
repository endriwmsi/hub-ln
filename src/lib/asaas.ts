/**
 * Serviço de integração com a API do Asaas
 * Responsável por criar clientes, cobranças via Pix e verificar pagamentos
 */

import type {
  AsaasCustomer,
  AsaasPayment,
  AsaasPixQrCode,
  AsaasWebhookEvent,
  AsaasWebhookPayload,
} from "@/shared/types/asaas";

const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY = `$aact_${process.env.ASAAS_API_KEY}` || "";

class AsaasService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = ASAAS_API_URL;
    this.apiKey = ASAAS_API_KEY;

    if (!this.apiKey) {
      console.warn("[Asaas] API Key não configurada");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        access_token: this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[Asaas] API Error:", {
        status: response.status,
        error,
      });
      throw new Error(
        error.errors?.[0]?.description ||
          error.message ||
          `Erro na API Asaas: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Busca um cliente pelo CPF/CNPJ
   */
  async findCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
    try {
      const cleanCpfCnpj = cpfCnpj.replace(/\D/g, "");
      const response = await this.request<{
        data: AsaasCustomer[];
        totalCount: number;
      }>(`/customers?cpfCnpj=${cleanCpfCnpj}`);

      return response.data[0] || null;
    } catch (error) {
      console.error("[Asaas] Erro ao buscar cliente:", error);
      return null;
    }
  }

  /**
   * Cria um novo cliente no Asaas
   */
  async createCustomer(data: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    externalReference?: string;
  }): Promise<AsaasCustomer> {
    const cleanCpfCnpj = data.cpfCnpj.replace(/\D/g, "");
    const cleanPhone = data.phone?.replace(/\D/g, "");

    const response = await this.request<AsaasCustomer>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        cpfCnpj: cleanCpfCnpj,
        mobilePhone: cleanPhone,
        externalReference: data.externalReference,
      }),
    });

    return response;
  }

  /**
   * Busca ou cria um cliente
   */
  async getOrCreateCustomer(data: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    externalReference?: string;
  }): Promise<AsaasCustomer> {
    // Tenta encontrar cliente existente
    const existingCustomer = await this.findCustomerByCpfCnpj(data.cpfCnpj);

    if (existingCustomer) {
      return existingCustomer;
    }

    // Cria novo cliente se não existir
    return this.createCustomer(data);
  }

  /**
   * Cria uma cobrança via Pix
   */
  async createPixPayment(data: {
    customerId: string;
    value: number;
    description?: string;
    externalReference?: string;
    dueDate?: string;
  }): Promise<AsaasPayment> {
    const today = new Date();
    const dueDate = data.dueDate || today.toISOString().split("T")[0];

    const response = await this.request<AsaasPayment>("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: data.customerId,
        billingType: "PIX",
        value: data.value,
        dueDate,
        description: data.description || "Pagamento de serviços HUB-LN",
        externalReference: data.externalReference,
      }),
    });

    return response;
  }

  /**
   * Obtém o QR Code Pix de uma cobrança
   */
  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    const response = await this.request<AsaasPixQrCode>(
      `/payments/${paymentId}/pixQrCode`,
    );

    return response;
  }

  /**
   * Consulta o status de um pagamento
   */
  async getPayment(paymentId: string): Promise<AsaasPayment> {
    const response = await this.request<AsaasPayment>(`/payments/${paymentId}`);
    return response;
  }

  /**
   * Verifica se o pagamento foi confirmado
   */
  async isPaymentConfirmed(paymentId: string): Promise<boolean> {
    const payment = await this.getPayment(paymentId);
    return ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(
      payment.status,
    );
  }

  /**
   * Valida o payload do webhook
   */
  validateWebhookPayload(
    payload: unknown,
  ):
    | { valid: true; data: AsaasWebhookPayload }
    | { valid: false; error: string } {
    if (!payload || typeof payload !== "object") {
      return { valid: false, error: "Payload inválido" };
    }

    const data = payload as Record<string, unknown>;

    if (!data.event || typeof data.event !== "string") {
      return { valid: false, error: "Evento não encontrado" };
    }

    if (!data.payment || typeof data.payment !== "object") {
      return { valid: false, error: "Dados de pagamento não encontrados" };
    }

    return {
      valid: true,
      data: payload as AsaasWebhookPayload,
    };
  }

  /**
   * Verifica se o evento indica pagamento confirmado
   */
  isPaymentConfirmedEvent(event: AsaasWebhookEvent): boolean {
    return ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"].includes(event);
  }
}

// Exporta instância única do serviço
export const asaas = new AsaasService();
