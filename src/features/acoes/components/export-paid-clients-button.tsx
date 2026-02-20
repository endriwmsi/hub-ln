"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { exportPaidClients } from "../actions";

type ExportPaidClientsButtonProps = {
  acaoId: string;
};

export function ExportPaidClientsButton({
  acaoId,
}: ExportPaidClientsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info("Exportando clientes pagos...", {
        description: "Por favor, aguarde.",
      });

      const result = await exportPaidClients(acaoId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erro ao exportar clientes");
      }

      // Converter base64 para blob
      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportação concluída!", {
        description: `${result.data.totalRecords} cliente(s) exportado(s) e marcados como extraídos.`,
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar", {
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível exportar os clientes.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="default"
      size="sm"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exportando..." : "Exportar Pagos"}
    </Button>
  );
}
