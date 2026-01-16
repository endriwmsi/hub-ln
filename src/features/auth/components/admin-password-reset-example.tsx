/**
 * EXEMPLO DE USO DO SISTEMA DE RECUPERAÇÃO DE SENHA MANUAL
 *
 * Este arquivo demonstra como implementar uma interface administrativa
 * para gerenciar solicitações de redefinição de senha.
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  adminListPasswordResetRequestsAction,
  adminSendPasswordResetAction,
} from "@/features/auth/actions/admin-password-reset";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

/**
 * EXEMPLO 1: Formulário para enviar email de redefinição
 */
export function AdminPasswordResetForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await adminSendPasswordResetAction({
        userEmail: email,
      });

      if (result.success) {
        toast.success(result.message);
        setEmail("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao enviar email de redefinição");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Link de Redefinição de Senha</CardTitle>
        <CardDescription>
          Como administrador, você pode enviar manualmente um link de
          redefinição de senha para qualquer usuário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do Usuário</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar Link de Redefinição"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * EXEMPLO 2: Lista de solicitações pendentes
 */
export function AdminPasswordResetList() {
  const [requests, setRequests] = useState<
    Array<{
      email: string;
      createdAt: Date;
      expiresAt: Date;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const result = await adminListPasswordResetRequestsAction();
      if (result.success && result.data) {
        setRequests(result.data);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao carregar solicitações");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Redefinição Pendentes</CardTitle>
        <CardDescription>
          Visualize todas as solicitações de redefinição de senha que ainda não
          expiraram.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={loadRequests} disabled={isLoading} className="mb-4">
          {isLoading ? "Carregando..." : "Atualizar Lista"}
        </Button>

        {requests.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma solicitação pendente
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => (
              <div
                key={`${request.email}-${request.createdAt}`}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{request.email}</p>
                  <p className="text-muted-foreground text-xs">
                    Criado em:{" "}
                    {new Date(request.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Expira em:{" "}
                    {new Date(request.expiresAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * EXEMPLO 3: Página administrativa completa
 */
export default function AdminPasswordResetPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Redefinição de Senhas</h1>
        <p className="text-muted-foreground">
          Painel administrativo para gerenciar solicitações de redefinição de
          senha
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AdminPasswordResetForm />
        <AdminPasswordResetList />
      </div>

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Solicitação do Usuário</h3>
            <p className="text-sm text-muted-foreground">
              Quando um usuário clica em "Esqueci minha senha", a solicitação é
              registrada mas o email NÃO é enviado automaticamente. O sistema
              apenas loga a solicitação.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Ação Manual do Admin</h3>
            <p className="text-sm text-muted-foreground">
              O administrador acessa este painel e envia manualmente o link de
              redefinição para o usuário usando o formulário acima.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Email Personalizado</h3>
            <p className="text-sm text-muted-foreground">
              O email enviado tem um design específico com acento vermelho
              (diferente dos emails de confirmação que têm acento dourado),
              alertando sobre segurança e com expiração de 1 hora.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Separação de Serviços</h3>
            <p className="text-sm text-muted-foreground">
              • <strong>send-email.ts</strong> - Usado para emails de
              confirmação de conta
              <br />• <strong>send-password-reset-email.ts</strong> - Usado
              exclusivamente para recuperação de senha (ação manual do admin)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
