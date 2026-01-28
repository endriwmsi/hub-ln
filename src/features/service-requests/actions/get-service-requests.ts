"use server";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/core/db";
import { acao, serviceRequest, services, user } from "@/core/db/schema";
import type { ServiceRequestFilters } from "../schemas";

type ServiceRequestWithRelations = {
  id: string;
  userId: string;
  serviceId: string;
  acaoId: string | null;
  formData: Record<string, unknown>;
  documents: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }> | null;
  quantity: number;
  totalPrice: string;
  status: "pending" | "processing" | "completed" | "cancelled" | "rejected";
  notes: string | null;
  paid: boolean;
  paidAt: Date | null;
  processedAt: Date | null;
  processedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  service: {
    id: string;
    title: string;
    slug: string;
  };
  acao: {
    id: string;
    nome: string;
  } | null;
};

export async function getServiceRequests(filters: ServiceRequestFilters) {
  const {
    search,
    status,
    serviceId,
    acaoId,
    userId,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    pageSize = 10,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (search) {
    conditions.push(
      sql`(${user.name} ILIKE ${`%${search}%`} OR ${user.email} ILIKE ${`%${search}%`})`,
    );
  }

  if (status && status !== "all") {
    conditions.push(eq(serviceRequest.status, status));
  }

  if (serviceId) {
    conditions.push(eq(serviceRequest.serviceId, serviceId));
  }

  if (acaoId) {
    conditions.push(eq(serviceRequest.acaoId, acaoId));
  }

  if (userId) {
    conditions.push(eq(serviceRequest.userId, userId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Ordenação
  const orderColumn = {
    createdAt: serviceRequest.createdAt,
    updatedAt: serviceRequest.updatedAt,
    status: serviceRequest.status,
    totalPrice: serviceRequest.totalPrice,
  }[sortBy];

  const orderDirection = sortOrder === "asc" ? asc : desc;

  // Query principal
  const requests = await db
    .select({
      id: serviceRequest.id,
      userId: serviceRequest.userId,
      serviceId: serviceRequest.serviceId,
      acaoId: serviceRequest.acaoId,
      formData: serviceRequest.formData,
      documents: serviceRequest.documents,
      quantity: serviceRequest.quantity,
      totalPrice: serviceRequest.totalPrice,
      status: serviceRequest.status,
      notes: serviceRequest.notes,
      paid: serviceRequest.paid,
      paidAt: serviceRequest.paidAt,
      processedAt: serviceRequest.processedAt,
      processedById: serviceRequest.processedById,
      createdAt: serviceRequest.createdAt,
      updatedAt: serviceRequest.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      service: {
        id: services.id,
        title: services.title,
        slug: services.slug,
      },
      acao: {
        id: acao.id,
        nome: acao.nome,
      },
    })
    .from(serviceRequest)
    .innerJoin(user, eq(serviceRequest.userId, user.id))
    .innerJoin(services, eq(serviceRequest.serviceId, services.id))
    .leftJoin(acao, eq(serviceRequest.acaoId, acao.id))
    .where(whereClause)
    .orderBy(orderDirection(orderColumn))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Contar total
  const totalResult = await db
    .select({ count: count() })
    .from(serviceRequest)
    .innerJoin(user, eq(serviceRequest.userId, user.id))
    .innerJoin(services, eq(serviceRequest.serviceId, services.id))
    .leftJoin(acao, eq(serviceRequest.acaoId, acao.id))
    .where(whereClause);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: requests as ServiceRequestWithRelations[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function getServiceRequestById(id: string) {
  const result = await db
    .select({
      id: serviceRequest.id,
      userId: serviceRequest.userId,
      serviceId: serviceRequest.serviceId,
      acaoId: serviceRequest.acaoId,
      formData: serviceRequest.formData,
      documents: serviceRequest.documents,
      quantity: serviceRequest.quantity,
      totalPrice: serviceRequest.totalPrice,
      status: serviceRequest.status,
      notes: serviceRequest.notes,
      paid: serviceRequest.paid,
      paidAt: serviceRequest.paidAt,
      processedAt: serviceRequest.processedAt,
      processedById: serviceRequest.processedById,
      createdAt: serviceRequest.createdAt,
      updatedAt: serviceRequest.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        cnpj: user.cnpj,
      },
      service: {
        id: services.id,
        title: services.title,
        slug: services.slug,
        basePrice: services.basePrice,
        type: services.type,
        requiresDocument: services.requiresDocument,
      },
      acao: {
        id: acao.id,
        nome: acao.nome,
      },
    })
    .from(serviceRequest)
    .innerJoin(user, eq(serviceRequest.userId, user.id))
    .innerJoin(services, eq(serviceRequest.serviceId, services.id))
    .leftJoin(acao, eq(serviceRequest.acaoId, acao.id))
    .where(eq(serviceRequest.id, id))
    .limit(1);

  return result[0] || null;
}
