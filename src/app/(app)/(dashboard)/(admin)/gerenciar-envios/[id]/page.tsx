"use server";

import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Hash,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getServiceRequestById } from "@/features/service-requests";
import { UpdateStatusDialog } from "@/features/service-requests/components/update-status-dialog";
import {
  type ServiceRequestStatus,
  serviceRequestStatusColors,
  serviceRequestStatusLabels,
} from "@/features/service-requests/schemas";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminServiceRequestDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const request = await getServiceRequestById(id);

  if (!request) {
    notFound();
  }

  const formData = request.formData as Record<string, unknown>;
  const documents = request.documents as Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }> | null;

  const status = request.status as ServiceRequestStatus;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatFieldName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatFieldValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link
          href="/gerenciar-envios"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Detalhes da Solicitação</h1>
          <p className="text-muted-foreground">
            Solicitação #{request.id.slice(0, 8)}
          </p>
        </div>
        <UpdateStatusDialog requestId={request.id} currentStatus={status} />
      </div>

      <div className="grid gap-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">{request.service?.title || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Solicitante</p>
                  <p className="font-medium">{request.user?.name || "-"}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Quantidade</p>
                  <p className="font-medium">{request.quantity}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {new Date(request.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={serviceRequestStatusColors[status]}>
                  {serviceRequestStatusLabels[status]}
                </Badge>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(request.totalPrice))}
                </p>
              </div>
            </div>

            {request.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Observações do Admin
                  </p>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {request.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Form Data Card */}
        {formData && Object.keys(formData).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Formulário</CardTitle>
              <CardDescription>
                Informações preenchidas pelo usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {Object.entries(formData).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-muted-foreground">
                      {formatFieldName(key)}
                    </span>
                    <span className="font-medium text-right max-w-[60%] overflow-wrap-break-word">
                      {formatFieldValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Card */}
        {documents && documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos Anexados</CardTitle>
              <CardDescription>
                {documents.length} documento(s) enviado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.url}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
