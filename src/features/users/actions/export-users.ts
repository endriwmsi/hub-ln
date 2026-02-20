"use server";

import { and, ilike, or, sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { type UserFilters, userFiltersSchema } from "../schemas";

export async function exportUsers(filters: UserFilters) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    // Valida os filtros
    const validated = userFiltersSchema.parse(filters);

    const { search, role, activeStatus } = validated;

    // Construir condições de filtro
    const conditions = [];

    // Filtro de busca (nome, email, telefone, cpf, cnpj)
    if (search) {
      conditions.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`),
          ilike(user.phone, `%${search}%`),
          ilike(user.cpf, `%${search}%`),
          ilike(user.cnpj, `%${search}%`),
        ),
      );
    }

    // Filtro de role
    if (role && role !== "all") {
      conditions.push(sql`${user.role} = ${role}`);
    }

    // Construir a query com filtros
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Buscar TODOS os usuários (sem paginação)
    const allUsers = await db.query.user.findMany({
      where: whereClause,
      with: {
        subscription: true,
      },
    });

    // Filtrar por status ativo (baseado na subscription)
    let filteredUsers = allUsers;
    if (activeStatus && activeStatus !== "all") {
      filteredUsers = allUsers.filter((u) => {
        const isActive =
          u.subscription?.status === "active" ||
          u.subscription?.status === "trial";
        return activeStatus === "active" ? isActive : !isActive;
      });
    }

    // Criar mapa de referralCode -> email para resolver os indicadores
    const referralCodeToEmail = new Map<string, string>();
    for (const u of allUsers) {
      referralCodeToEmail.set(u.referralCode, u.email);
    }

    // Preparar dados para exportação
    const exportData = filteredUsers.map((u) => ({
      ID: u.id,
      Nome: u.name,
      Email: u.email,
      "Email Verificado": u.emailVerified ? "Sim" : "Não",
      Telefone: u.phone || "",
      CPF: u.cpf || "",
      CNPJ: u.cnpj || "",
      Tipo: u.role === "admin" ? "Admin" : "Usuário",
      Aprovado: u.approved ? "Sim" : "Não",
      "Status Assinatura": u.subscription?.status || "Inativo",
      Rua: u.street || "",
      Número: u.number || "",
      Complemento: u.complement || "",
      Bairro: u.neighborhood || "",
      Cidade: u.city || "",
      UF: u.uf || "",
      CEP: u.cep || "",
      "Código de Indicação": u.referralCode || "",
      "Indicado Por": u.referredBy
        ? referralCodeToEmail.get(u.referredBy) || u.referredBy
        : "",
      "Data de Cadastro": new Date(u.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Última Atualização": new Date(u.updatedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // Criar workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Ajustar largura das colunas
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        Math.max(
          ...exportData.map(
            (row) => String(row[key as keyof typeof row]).length,
          ),
        ),
      ),
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuários");

    // Gerar buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Converter para base64 para transferir pelo servidor
    const base64 = buffer.toString("base64");

    return {
      success: true,
      data: {
        base64,
        filename: `usuarios-${new Date().toISOString().split("T")[0]}.xlsx`,
        totalRecords: exportData.length,
      },
    };
  } catch (error) {
    console.error("Erro ao exportar usuários:", error);
    return {
      success: false,
      error: "Erro ao exportar usuários",
    };
  }
}

export type ExportUsersResponse = Awaited<ReturnType<typeof exportUsers>>;
