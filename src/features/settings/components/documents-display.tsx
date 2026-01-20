"use client";

import { formatCNPJ, formatCPF } from "@/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface DocumentsDisplayProps {
  cpf: string;
  cnpj: string;
}

export function DocumentsDisplay({ cpf, cnpj }: DocumentsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos</CardTitle>
        <CardDescription>
          Seus documentos cadastrados (não podem ser alterados)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formatCPF(cpf)}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formatCNPJ(cnpj)}
            disabled
            className="bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
}
