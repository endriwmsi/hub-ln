import AbacatePay from "abacatepay-nodejs-sdk";

const abacatepay = AbacatePay(process.env.ABACATEPAY_API_KEY || "");

export const createCustomer = async (customer: {
  name: string;
  cellphone: string;
  email: string;
  cpf?: string;
  cnpj?: string;
}) => {
  try {
    const response = await abacatepay.customer.create({
      name: customer.name,
      cellphone: customer.cellphone,
      email: customer.email,
      taxId: customer.cpf || customer.cnpj || undefined,
    });

    return response;
  } catch (error) {
    console.error("Erro ao criar customer no AbacatePay:", error);
    
    // Se for erro de parsing JSON, retornar erro estruturado
    if (error instanceof SyntaxError) {
      return {
        error: "Erro de comunicação com a API de pagamentos",
        data: null,
      };
    }
    
    // Para outros erros, repassar
    throw error;
  }
};

export const createPixQrCode = async ({
  customer,
  amount,
}: {
  customer: {
    name: string;
    cellphone: string;
    email: string;
    cpf?: string;
    cnpj?: string;
  };
  amount: number;
}) => {
  const response = await abacatepay.pixQrCode.create({
    amount,
    expiresIn: 60 * 5,
    description: "Assinatura Mensal HUB-LN",
    customer: {
      name: customer.name,
      cellphone: customer.cellphone,
      email: customer.email,
      taxId: customer.cpf || customer.cnpj || undefined,
    },
  });

  return response;
};

export const checkPixQrCode = async (pixId: string) => {
  const response = await abacatepay.pixQrCode.check({ id: pixId });
  return response;
};

export default abacatepay;
