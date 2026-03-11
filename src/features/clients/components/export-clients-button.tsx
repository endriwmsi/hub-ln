"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { exportClients } from "../actions";
import { useClientFilters, useInvalidateClients } from "../hooks";

export function ExportClientsButton() {
  const { filters } = useClientFilters();
  const { invalidateClients } = useInvalidateClients();
  const [isExporting, setIsExporting] = useState(false);

  const { serviceId, userId } = filters;
  const isDisabled = !serviceId || isExporting;

  const handleExport = async () => {
    if (!serviceId) return;

    try {
      setIsExporting(true);
      console.log(
        "[ExportClientsButton] Starting export with serviceId:",
        serviceId,
        "userId:",
        userId,
      );
      toast.info("Exportando clientes...", {
        description: "Por favor, aguarde.",
      });

      const result = await exportClients({ serviceId, userId });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erro ao exportar clientes");
      }

      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportação concluída!", {
        description: `${result.data.totalRecords} cliente(s) exportado(s).`,
      });

      console.log(
        "[ExportClientsButton] Export successful, invalidating cache with filters:",
        filters,
      );
      // Invalidate clients cache to refresh the table with updated "extracted" status
      invalidateClients(filters);

      // Fallback: reload page after a short delay to ensure DB writes are persisted
      setTimeout(() => {
        console.log("[ExportClientsButton] Fallback: reloading page");
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("[ExportClientsButton] Error during export:", error);
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrapper span needed for tooltip to work on disabled buttons */}
          <span
            className={
              isDisabled && !isExporting ? "cursor-not-allowed" : undefined
            }
          >
            <Button
              onClick={handleExport}
              disabled={isDisabled}
              variant="outline"
              size="sm"
              className={
                isDisabled && !isExporting ? "pointer-events-none" : undefined
              }
            >
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar Clientes"}
            </Button>
          </span>
        </TooltipTrigger>
        {!serviceId && (
          <TooltipContent>
            <p>Selecione um serviço no filtro para exportar</p>
          </TooltipContent>
        )}
        {serviceId && userId && (
          <TooltipContent>
            <p>Exportar clientes do parceiro selecionado</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
