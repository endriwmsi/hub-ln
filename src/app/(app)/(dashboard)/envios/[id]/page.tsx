import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Hourglass,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/core/auth/dal";
import {
  getServiceRequestById,
  serviceRequestStatusColors,
  serviceRequestStatusLabels,
} from "@/features/service-requests";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type EnvioDetalhesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EnvioDetalhesPage({
  params,
}: EnvioDetalhesPageProps) {
  const { id } = await params;
  const session = await verifySession();

  const request = await getServiceRequestById(id);

  if (!request) {
    notFound();
  }

  // Verificar se o usuário tem permissão para ver (deve ser dono ou admin)
  const isOwner = request.userId === session.userId;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const formData = request.formData as Record<string, unknown>;
  const documents = (request.documents || []) as Array<{
    url: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }>;

  // Verificar se é um envio em lote (upload de planilha)
  const isBulkUpload = formData?.uploadType === "bulk";
  const bulkItems =
    (formData?.items as Array<{ nome: string; documento: string }>) || [];

  // Status dos itens (se houver)
  const itemsStatus = (request.itemsStatus || []) as Array<{
    nome: string;
    documento: string;
    status: "aguardando" | "baixas_completas" | "baixas_negadas";
    observacao?: string;
    processedAt?: string;
  }>;

  // Função para obter o status de um item
  const getItemStatus = (documento: string) => {
    return itemsStatus.find((item) => item.documento === documento);
  };

  // Componente de badge de status
  const StatusBadge = ({
    status,
  }: {
    status: "aguardando" | "baixas_completas" | "baixas_negadas";
  }) => {
    const config = {
      aguardando: {
        label: "Aguardando",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Hourglass,
      },
      baixas_completas: {
        label: "Baixas Completas",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle2,
      },
      baixas_negadas: {
        label: "Baixas Negadas",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle,
      },
    };

    const { label, className, icon: Icon } = config[status];

    return (
      <Badge variant="secondary" className={`gap-1 ${className}`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="container py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/envios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Detalhes da Solicitação</h1>
          <p className="text-muted-foreground">
            ID: {request.id.slice(0, 8)}...
          </p>
        </div>
        <Badge
          className={serviceRequestStatusColors[request.status]}
          variant="secondary"
        >
          {serviceRequestStatusLabels[request.status]}
        </Badge>
      </div>

      {/* Informações gerais */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">{request.service.title}</p>

            {/* Preço por unidade (preço de revenda) */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Preço por unidade:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(request.totalPrice) / request.quantity)}
              </span>
            </div>

            {/* Quantidade */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quantidade:</span>
              <span className="font-medium">{request.quantity} unidade(s)</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(request.totalPrice))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Criado em:</span>
              <span>
                {format(new Date(request.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </span>
            </div>
            {request.processedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processado em:</span>
                <span>
                  {format(
                    new Date(request.processedAt),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR },
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin: informações do usuário */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <span className="text-sm text-muted-foreground">Nome:</span>
                <p className="font-medium">{request.user.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">E-mail:</span>
                <p className="font-medium">{request.user.email}</p>
              </div>
              {request.user.phone && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Telefone:
                  </span>
                  <p className="font-medium">{request.user.phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados do formulário */}
      {isBulkUpload ? (
        <Card>
          <CardHeader>
            <CardTitle>Nomes Enviados</CardTitle>
            <CardDescription>
              {bulkItems.length} nome(s) enviado(s) via planilha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-100 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground w-12">
                      #
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Documento
                    </th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bulkItems.map((item, index) => {
                    const itemStatus = getItemStatus(item.documento);
                    const status = itemStatus?.status || "aguardando";

                    return (
                      <tr
                        key={`${item.documento}-${index}`}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 text-sm text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="py-3 text-sm font-medium">
                          {item.nome}
                        </td>
                        <td className="py-3 text-sm font-mono text-muted-foreground">
                          {item.documento}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dados Informados</CardTitle>
            <CardDescription>
              Informações preenchidas no formulário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(formData).map(([key, value]) => {
                // Ignorar campos internos
                if (key.startsWith("_")) return null;

                return (
                  <div key={key}>
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <p className="font-medium">{String(value) || "-"}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos Anexados</CardTitle>
            <CardDescription>
              Arquivos enviados junto com a solicitação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.url}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.size / 1024).toFixed(1)} KB •{" "}
                        {format(new Date(doc.uploadedAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {request.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{request.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
