import { ArrowLeft, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormBuilder, getFormFieldsByServiceId } from "@/features/form-fields";
import { getServiceById } from "@/features/services";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

type ServiceFormPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceFormPage({
  params,
}: ServiceFormPageProps) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  const formFields = await getFormFieldsByServiceId(id);

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gerenciar-servicos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{service.title}</h1>
            <Badge variant={service.type === "form" ? "default" : "secondary"}>
              {service.type === "form" ? "Formulário" : "Simples"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{service.description}</p>
        </div>
      </div>

      {/* Informações do serviço */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(service.basePrice))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Campos do Formulário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formFields.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Requer Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {service.requiresDocument ? "Sim" : "Não"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="form-fields" className="space-y-4">
        <TabsList>
          <TabsTrigger value="form-fields" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Campos do Formulário
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form-fields">
          <Card>
            <CardHeader>
              <CardTitle>Construtor de Formulário</CardTitle>
              <CardDescription>
                Adicione e organize os campos que serão exibidos para os
                usuários ao solicitar este serviço.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormBuilder serviceId={id} fields={formFields} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Serviço</CardTitle>
              <CardDescription>
                Configure opções avançadas do serviço.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações avançadas serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
