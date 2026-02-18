"use client";

import { AlertCircle, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Service } from "@/core/db/schema";
import { CouponInput } from "@/features/coupons";
import { createBulkServiceRequests } from "@/features/service-requests";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type ExcelUploadFormProps = {
  service: Service;
  acaoId?: string;
  costPrice?: string;
};

type ParsedRow = {
  nome: string;
  documento: string;
  valid: boolean;
  error?: string;
};

export function ExcelUploadForm({
  service,
  acaoId,
  costPrice,
}: ExcelUploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Estado para cupom aplicado
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string;
    couponCode: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountPerUnit: number;
    totalDiscount: number;
  } | null>(null);

  // Função para validar CPF/CNPJ
  const validateDocument = (
    doc: string,
  ): { valid: boolean; error?: string } => {
    const cleaned = doc.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return { valid: true };
    } else if (cleaned.length === 14) {
      return { valid: true };
    }
    return { valid: false, error: "Documento inválido" };
  };

  // Parse CSV simples (fallback se XLSX não disponível)
  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const rows: ParsedRow[] = [];

    // Pular cabeçalho
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;]/).map((col) => col.trim());
      if (cols.length >= 2) {
        const nome = cols[0];
        const documento = cols[1].replace(/\D/g, "");
        const validation = validateDocument(documento);

        rows.push({
          nome,
          documento,
          valid: validation.valid && nome.length > 0,
          error: !nome ? "Nome obrigatório" : validation.error,
        });
      }
    }

    return rows;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setParsedData([]);

    // Validar tipo de arquivo
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    const isValidType =
      validTypes.includes(file.type) ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.name.endsWith(".csv");

    if (!isValidType) {
      setParseError("Tipo de arquivo inválido. Use .xlsx, .xls ou .csv");
      return;
    }

    setFileName(file.name);

    try {
      // Para CSV, processar diretamente
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        const text = await file.text();
        const rows = parseCSV(text);
        setParsedData(rows);
      } else {
        // Para XLSX, usar a API de upload para processar no servidor
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "xlsx");

        const response = await fetch("/api/upload?parse=true", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro ao processar arquivo");
        }

        const data = await response.json();

        if (data.data) {
          const rows: ParsedRow[] = data.data.map(
            (row: { nome: string; documento: string }) => {
              const validation = validateDocument(row.documento);
              return {
                nome: row.nome,
                documento: row.documento.replace(/\D/g, ""),
                valid: validation.valid && row.nome?.length > 0,
                error: !row.nome ? "Nome obrigatório" : validation.error,
              };
            },
          );
          setParsedData(rows);
        }
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      setParseError(
        "Erro ao processar arquivo. Verifique se o formato está correto.",
      );
    }
  };

  const clearFile = () => {
    setParsedData([]);
    setFileName(null);
    setParseError(null);
  };

  const handleSubmit = async () => {
    const validRows = parsedData.filter((row) => row.valid);

    if (validRows.length === 0) {
      toast.error("Nenhum registro válido para enviar");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBulkServiceRequests({
        serviceId: service.id,
        acaoId: acaoId as string,
        items: validRows.map((row) => ({
          nome: row.nome,
          documento: row.documento,
        })),
        couponCode: appliedCoupon?.couponCode,
        couponId: appliedCoupon?.couponId,
        discountPerUnit: appliedCoupon?.discountPerUnit,
      });

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar solicitações");
      }

      toast.success(
        `${result.data?.created} nome(s) enviado(s) com sucesso! Total: ${new Intl.NumberFormat(
          "pt-BR",
          { style: "currency", currency: "BRL" },
        ).format(result.data?.totalPrice || 0)}`,
      );
      router.push("/envios");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao enviar. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedData.filter((row) => row.valid).length;
  const invalidCount = parsedData.length - validCount;
  // Usar preço de custo (preço do indicador) se disponível, senão usar preço base
  const unitPrice = costPrice ? Number(costPrice) : Number(service.basePrice);
  const finalUnitPrice = appliedCoupon
    ? unitPrice - appliedCoupon.discountPerUnit
    : unitPrice;
  const totalPrice = finalUnitPrice * validCount;
  const totalDiscount = appliedCoupon
    ? appliedCoupon.discountPerUnit * validCount
    : 0;

  return (
    <div className="space-y-6">
      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload de Planilha
          </CardTitle>
          <CardDescription>
            Envie uma planilha com os nomes que deseja processar. O arquivo deve
            conter duas colunas: Nome e Documento (CPF ou CNPJ).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Formato esperado:</p>
            <div className="bg-muted rounded-lg p-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold">Nome</span>
                <span className="font-semibold">Documento</span>
                <span>João da Silva</span>
                <span>123.456.789-00</span>
                <span>Empresa LTDA</span>
                <span>12.345.678/0001-90</span>
              </div>
            </div>
          </div>

          {/* Upload area */}
          {!fileName ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="font-medium">Clique para selecionar</span>
                <span className="text-sm text-muted-foreground">
                  ou arraste o arquivo aqui
                </span>
                <span className="text-xs text-muted-foreground mt-2">
                  Formatos aceitos: .xlsx, .xls, .csv
                </span>
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {parsedData.length} registros encontrados
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview dos dados */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
            <CardDescription>
              {validCount} registro(s) válido(s)
              {invalidCount > 0 && (
                <span className="text-destructive">
                  {" "}
                  • {invalidCount} com erro
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 100).map((row, index) => (
                    <TableRow
                      key={`${row.documento}-${index}`}
                      className={!row.valid ? "bg-destructive/10" : ""}
                    >
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>{row.nome || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.documento || "-"}
                      </TableCell>
                      <TableCell>
                        {row.valid ? (
                          <span className="text-green-600 text-sm">
                            ✓ Válido
                          </span>
                        ) : (
                          <span className="text-destructive text-sm">
                            {row.error}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 100 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Mostrando 100 de {parsedData.length} registros
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {/* Input de Cupom */}
            <div className="w-full">
              <CouponInput
                serviceId={service.id}
                quantity={validCount}
                unitPrice={unitPrice}
                onApplyCoupon={(couponData) => setAppliedCoupon(couponData)}
                onRemoveCoupon={() => setAppliedCoupon(null)}
                appliedCoupon={
                  appliedCoupon
                    ? {
                        couponCode: appliedCoupon.couponCode,
                        totalDiscount: appliedCoupon.totalDiscount,
                      }
                    : null
                }
              />
            </div>

            {/* Resumo do preço */}
            <div className="w-full border rounded-lg p-4 bg-muted/50 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {validCount} nome(s) x{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(unitPrice)}
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(unitPrice * validCount)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Desconto total</span>
                  <span className="font-medium text-green-600">
                    -{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalDiscount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-muted-foreground font-semibold">
                  Total final
                </span>
                <span className="text-xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalPrice)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isSubmitting || validCount === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                `Enviar ${validCount} nome(s)`
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
