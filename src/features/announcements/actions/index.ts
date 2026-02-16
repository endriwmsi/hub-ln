"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { announcement } from "@/core/db/schema";
import {
  type CreateAnnouncementInput,
  createAnnouncementSchema,
  type UpdateAnnouncementInput,
  updateAnnouncementSchema,
} from "../schemas";

export async function getAnnouncements() {
  try {
    const announcements = await db
      .select()
      .from(announcement)
      .orderBy(desc(announcement.createdAt));

    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
}

export async function getActiveAnnouncements() {
  try {
    const announcements = await db
      .select()
      .from(announcement)
      .where(eq(announcement.active, true))
      .orderBy(desc(announcement.createdAt));

    return announcements;
  } catch (error) {
    console.error("Error fetching active announcements:", error);
    throw error;
  }
}

export async function createAnnouncement(input: CreateAnnouncementInput) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Acesso negado" };
    }

    const validatedData = createAnnouncementSchema.parse(input);

    const [newAnnouncement] = await db
      .insert(announcement)
      .values(validatedData)
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/gerenciar-avisos");

    return {
      success: true,
      message: "Aviso criado com sucesso",
      data: newAnnouncement,
    };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false, message: "Erro ao criar aviso" };
  }
}

export async function updateAnnouncement(input: UpdateAnnouncementInput) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Acesso negado" };
    }

    const validatedData = updateAnnouncementSchema.parse(input);

    const [updatedAnnouncement] = await db
      .update(announcement)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        active: validatedData.active,
      })
      .where(eq(announcement.id, validatedData.id))
      .returning();

    if (!updatedAnnouncement) {
      return { success: false, message: "Aviso não encontrado" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/gerenciar-avisos");

    return {
      success: true,
      message: "Aviso atualizado com sucesso",
      data: updatedAnnouncement,
    };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { success: false, message: "Erro ao atualizar aviso" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Acesso negado" };
    }

    await db.delete(announcement).where(eq(announcement.id, id));

    revalidatePath("/dashboard");
    revalidatePath("/gerenciar-avisos");

    return { success: true, message: "Aviso deletado com sucesso" };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, message: "Erro ao deletar aviso" };
  }
}

export async function toggleAnnouncementStatus(id: string) {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Acesso negado" };
    }

    const existingAnnouncement = await db.query.announcement.findFirst({
      where: eq(announcement.id, id),
    });

    if (!existingAnnouncement) {
      return { success: false, message: "Aviso não encontrado" };
    }

    const [updated] = await db
      .update(announcement)
      .set({ active: !existingAnnouncement.active })
      .where(eq(announcement.id, id))
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/gerenciar-avisos");

    return {
      success: true,
      message: `Aviso ${updated.active ? "ativado" : "desativado"} com sucesso`,
      data: updated,
    };
  } catch (error) {
    console.error("Error toggling announcement status:", error);
    return { success: false, message: "Erro ao alterar status do aviso" };
  }
}
