"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/core/auth/dal";
import { db } from "@/core/db";
import { subscription, user as userSchema } from "@/core/db/schema";
import {
  checkPixQrCode,
  createCustomer,
  createPixQrCode,
} from "@/lib/abacatepay";

// Helper para verificar se a resposta do SDK tem erro
function hasError(
  response: { error: string } | { error: null; data: unknown },
): response is { error: string } {
  return response.error !== null;
}

export async function createBilling() {
  const user = await getUser();

  if (!user) {
    return { success: false, message: "Usuário não autenticado" };
  }

  // Se não existe customerId, tentar criar agora
  if (!user.abacatePayCustomerId) {
    try {
      console.log("Customer ID não encontrado, criando customer...");

      const customerData = {
        name: user.name,
        cellphone: user.phone,
        email: user.email,
        cpf: user.cpf,
        cnpj: user.cnpj,
      };

      const newCustomer = await createCustomer(customerData);

      if (newCustomer.error || !newCustomer.data?.id) {
        console.error("Erro ao criar customer:", newCustomer.error);
        return {
          success: false,
          message:
            "Não foi possível criar cliente no sistema de pagamentos. Tente novamente mais tarde.",
        };
      }

      // Atualizar o customerId no banco
      await db
        .update(userSchema)
        .set({ abacatePayCustomerId: newCustomer.data.id })
        .where(eq(userSchema.id, user.id));

      // Atualizar o objeto user com o novo customerId
      user.abacatePayCustomerId = newCustomer.data.id;

      console.log("Customer criado com sucesso:", newCustomer.data.id);
    } catch (error) {
      console.error("Erro ao criar customer:", error);

      if (error instanceof SyntaxError) {
        return {
          success: false,
          message:
            "Erro de comunicação com o sistema de pagamentos. Tente novamente em alguns instantes.",
        };
      }

      return {
        success: false,
        message: "Erro ao criar cliente no sistema de pagamentos",
      };
    }
  }

  try {
    // Buscar assinatura existente do usuário
    const [existingSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, user.id))
      .limit(1);

    if (existingSubscription) {
      try {
        if (existingSubscription.pixId) {
          const pixQrCodeResult = await checkPixQrCode(
            existingSubscription.pixId,
          );

          // Verificar se houve erro na verificação
          if (hasError(pixQrCodeResult)) {
            console.error("Erro ao verificar QR Code:", pixQrCodeResult.error);

            // Se for rate limiting, retornar mensagem específica
            if (
              typeof pixQrCodeResult.error === "string" &&
              pixQrCodeResult.error.toLowerCase().includes("too many")
            ) {
              return {
                success: false,
                message:
                  "Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.",
              };
            }

            // Para outros erros, tentar criar novo QR Code
            console.log("Erro na verificação, criando novo QR Code...");
          } else {
            // Sucesso na verificação - pixQrCodeResult.data está disponível
            const pixQrCode = pixQrCodeResult.data;

            // Verificar se o QR Code ainda está válido
            const now = new Date();
            const expiresAt = new Date(pixQrCode.expiresAt);

            if (pixQrCode.status === "PENDING" && expiresAt > now) {
              // QR Code ainda está válido
              return {
                success: true,
                data: {
                  billingId: pixQrCode.id,
                  amount: pixQrCode.amount / 100, // Converter de centavos para reais
                  brCode: pixQrCode.brCode,
                  brCodeBase64: pixQrCode.brCodeBase64,
                  expiresAt: pixQrCode.expiresAt,
                },
              };
            }

            if (pixQrCode.status === "PAID") {
              return {
                success: false,
                message: "Esta assinatura já foi paga",
              };
            }

            // Se chegou aqui, o QR Code está expirado ou cancelado
            console.log(
              `QR Code com status ${pixQrCode.status}, criando novo...`,
            );
          }
        }
      } catch (error) {
        console.error("Erro ao verificar QR Code existente:", error);

        // Verificar se é erro de rate limiting
        if (
          error instanceof SyntaxError &&
          error.message.includes("Too many")
        ) {
          return {
            success: false,
            message:
              "Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.",
          };
        }
        // Continuar para criar novo QR Code para outros erros
      }

      // Criar novo QR Code para a assinatura existente
      try {
        const newPixQrCodeResult = await createPixQrCode({
          amount: 5000,
          customer: {
            name: user.name,
            cellphone: user.phone,
            email: user.email,
            cpf: user.cpf,
            cnpj: user.cnpj,
          },
        });

        if (hasError(newPixQrCodeResult)) {
          console.error(
            "Erro ao criar novo QR Code:",
            newPixQrCodeResult.error,
          );

          // Verificar se é rate limiting
          if (
            typeof newPixQrCodeResult.error === "string" &&
            newPixQrCodeResult.error.toLowerCase().includes("too many")
          ) {
            return {
              success: false,
              message:
                "Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.",
            };
          }

          return {
            success: false,
            message: `Erro ao criar novo QR Code: ${newPixQrCodeResult.error}`,
          };
        }

        const newPixQrCode = newPixQrCodeResult.data;

        // Atualizar o billing ID e data de criação do QR Code
        await db
          .update(subscription)
          .set({
            pixId: newPixQrCode.id,
            pixQrCodeCreatedAt: new Date(),
          })
          .where(eq(subscription.id, existingSubscription.id));

        revalidatePath("/");

        return {
          success: true,
          data: {
            billingId: newPixQrCode.id,
            amount: newPixQrCode.amount / 100, // Converter de centavos para reais
            brCode: newPixQrCode.brCode,
            brCodeBase64: newPixQrCode.brCodeBase64,
            expiresAt: newPixQrCode.expiresAt,
          },
        };
      } catch (error) {
        console.error("Erro ao criar novo QR Code:", error);

        // Verificar se é erro de rate limiting (JSON parse error)
        if (
          error instanceof SyntaxError &&
          error.message.includes("Too many")
        ) {
          return {
            success: false,
            message:
              "Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.",
          };
        }

        return {
          success: false,
          message: "Erro ao criar novo QR Code",
        };
      }
    }

    // Se não existe subscription, criar uma nova
    if (!existingSubscription) {
      // Calcular data de expiração do trial (3 dias)
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 3);

      await db.insert(subscription).values({
        userId: user.id,
        pixId: "", // Será preenchido logo abaixo
        status: "trial",
        trialExpiresAt,
        pixQrCodeCreatedAt: new Date(),
      });

      // Buscar a subscription recém-criada
      const [newSubscription] = await db
        .select()
        .from(subscription)
        .where(eq(subscription.userId, user.id))
        .limit(1);

      if (!newSubscription) {
        return {
          success: false,
          message: "Erro ao criar assinatura",
        };
      }
    }

    // Neste ponto, sempre temos uma subscription
    // Buscar novamente para garantir que temos os dados mais recentes
    const [currentSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, user.id))
      .limit(1);

    if (!currentSubscription) {
      return {
        success: false,
        message: "Assinatura não encontrada",
      };
    }

    // Criar novo QR Code e atualizar a subscription existente
    try {
      const pixQrCodeResult = await createPixQrCode({
        amount: 5000,
        customer: {
          name: user.name,
          cellphone: user.phone,
          email: user.email,
          cpf: user.cpf,
          cnpj: user.cnpj,
        },
      });

      if (hasError(pixQrCodeResult)) {
        console.error("Erro ao criar QR Code:", pixQrCodeResult.error);

        // Verificar se é rate limiting
        if (
          typeof pixQrCodeResult.error === "string" &&
          pixQrCodeResult.error.toLowerCase().includes("too many")
        ) {
          return {
            success: false,
            message:
              "Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.",
          };
        }

        return {
          success: false,
          message: `Erro ao criar QR Code para pagamento: ${pixQrCodeResult.error}`,
        };
      }

      const pixQrCode = pixQrCodeResult.data;

      // Atualizar o pixId na subscription existente
      await db
        .update(subscription)
        .set({
          pixId: pixQrCode.id,
          pixQrCodeCreatedAt: new Date(),
        })
        .where(eq(subscription.id, currentSubscription.id));

      revalidatePath("/");

      return {
        success: true,
        data: {
          billingId: pixQrCode.id,
          amount: pixQrCode.amount / 100, // Converter de centavos para reais
          brCode: pixQrCode.brCode,
          brCodeBase64: pixQrCode.brCodeBase64,
          expiresAt: pixQrCode.expiresAt,
        },
      };
    } catch (error) {
      console.error("Erro ao criar QR Code PIX:", error);

      // Verificar se é erro de rate limiting (JSON parse error)
      if (error instanceof SyntaxError && error.message.includes("Too many")) {
        return {
          success: false,
          message:
            "Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.",
        };
      }

      return {
        success: false,
        message: "Erro ao criar QR Code para pagamento",
      };
    }
  } catch (error) {
    console.error("Erro geral ao criar billing:", error);
    return {
      success: false,
      message: "Erro ao criar cobrança",
    };
  }
}
