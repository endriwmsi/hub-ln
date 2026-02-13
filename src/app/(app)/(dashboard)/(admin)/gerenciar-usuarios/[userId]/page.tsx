import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserById } from "@/features/users/actions/get-user-by-id";
import { formatCNPJ, formatCPF, formatPhone } from "@/shared";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "Não disponível";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

interface UserPageProps {
  params: {
    userId: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params;

  const result = await getUserById(userId);

  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

  return (
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/usuarios" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalhes do Usuário
          </h1>
          <p className="text-muted-foreground">
            Informações detalhadas sobre o usuário
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base font-medium">{user.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Telefone
              </p>
              <p className="text-base">{formatPhone(user.phone || "")}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">CPF</p>
              <p className="text-base">{formatCPF(user.cpf || "")}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
              <p className="text-base">{formatCNPJ(user.cnpj || "")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status da Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Conta
              </p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Administrador" : "Usuário"}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Email Verificado
              </p>
              <Badge variant={user.emailVerified ? "default" : "destructive"}>
                {user.emailVerified ? "Verificado" : "Não Verificado"}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status de Aprovação
              </p>
              <Badge variant={user.approved ? "default" : "secondary"}>
                {user.approved ? "Aprovado" : "Pendente"}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Conta Banida
              </p>
              <Badge variant={user.banned ? "destructive" : "default"}>
                {user.banned ? "Sim" : "Não"}
              </Badge>
            </div>

            {user.banReason && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Motivo do Banimento
                </p>
                <p className="text-base">{user.banReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Temporais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Data de Cadastro
              </p>
              <p className="text-base">{formatDate(user.createdAt)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Última Atualização
              </p>
              <p className="text-base">{formatDate(user.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Identificadores */}
        <Card>
          <CardHeader>
            <CardTitle>Identificadores do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ID do Usuário
              </p>
              <p className="font-mono text-sm break-all">{user.id}</p>
            </div>

            {user.image && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Avatar
                </p>
                <Image
                  src={user.image}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
