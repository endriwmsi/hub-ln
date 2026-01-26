import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/core/db";
import { subscription } from "@/core/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data } = body;

    switch (data.pixQrCode.status) {
      case "PAID": {
        const [existingSubscription] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.pixId, data.pixQrCode.id))
          .limit(1);

        if (!existingSubscription) {
          console.error(
            "Assinatura não encontrada para pixId:",
            data.pixQrCode.id,
          );
          return NextResponse.json(
            { error: "Subscription not found" },
            { status: 404 },
          );
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await db
          .update(subscription)
          .set({
            status: "active",
            startDate: new Date(),
            endDate,
            trialExpiresAt: null,
          })
          .where(eq(subscription.id, existingSubscription.id));

        console.log("Assinatura ativada com sucesso:", existingSubscription.id);

        // Revalidar as rotas para atualizar o status na UI
        revalidatePath("/");
        revalidatePath("/configuracoes");
        revalidatePath("/configuracoes/assinatura");

        return NextResponse.json({ success: true });
      }
      default:
        body.event = "unknown";
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
