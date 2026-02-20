import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/core/auth/dal";
import { getAcaoById } from "@/features/acoes/actions/get-acao-by-id";
import { AcaoClientsTable } from "@/features/acoes/components/acao-clients-table";
import { ExportOverdueClientsButton } from "@/features/acoes/components/export-overdue-clients-button";
import { ExportPaidClientsButton } from "@/features/acoes/components/export-paid-clients-button";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type AcaoDetalhesPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function AcaoDetalhesPage({
  params,
  searchParams,
}: AcaoDetalhesPageProps) {
  await requireAdmin();

  const { id } = await params;
  const { search, status, page, pageSize } = await searchParams;

  // Buscar dados da ação
  const acaoResult = await getAcaoById(id);

  if (!acaoResult.success || !acaoResult.data) {
    notFound();
  }

  const acao = acaoResult.data;

  return (
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gerenciar-acoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{acao.nome}</h1>
            <Badge variant={acao.permiteEnvios ? "default" : "secondary"}>
              {acao.permiteEnvios ? "Envios Ativos" : "Envios Pausados"}
            </Badge>
            {acao.visivel && <Badge variant="outline">Visível</Badge>}
          </div>
          <p className="text-muted-foreground">
            Gerencie os clientes enviados nesta ação
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Criação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {format(new Date(acao.createdAt), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Criado por
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {acao.createdBy?.name || "-"}
            </p>
            <p className="text-sm text-muted-foreground">
              {acao.createdBy?.email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle>Clientes Enviados</CardTitle>
              <CardDescription>
                Lista de todos os nomes enviados nesta ação. Use os filtros para
                buscar por nome, documento ou status.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <ExportOverdueClientsButton acaoId={id} />
              <ExportPaidClientsButton acaoId={id} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AcaoClientsTable
            acaoId={id}
            initialSearch={search || ""}
            initialStatus={status || "all"}
            initialPage={page ? parseInt(page) : 1}
            initialPageSize={pageSize ? parseInt(pageSize) : 10}
          />
        </CardContent>
      </Card>
    </div>
  );
}
