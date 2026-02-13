"use client";

import { FileSpreadsheet, User } from "lucide-react";
import { useState } from "react";
import type { Service } from "@/core/db/schema";
import { Button } from "@/shared/components/ui/button";
import { ExcelUploadForm } from "./excel-upload-form";
import { SingleSubmissionForm } from "./single-submission-form";

type ServiceRequestModeSelectorProps = {
  service: Service;
  acaoId?: string;
  costPrice?: string;
};

type SubmissionMode = "single" | "bulk";

export function ServiceRequestModeSelector({
  service,
  acaoId,
  costPrice,
}: ServiceRequestModeSelectorProps) {
  const [mode, setMode] = useState<SubmissionMode>("single");

  return (
    <div className="space-y-6">
      {/* Seletor de modo */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-medium mb-3">Escolha o tipo de envio</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={mode === "single" ? "default" : "outline"}
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setMode("single")}
          >
            <User className="h-5 w-5" />
            <div className="flex flex-col items-center">
              <span className="font-semibold">Envio Único</span>
              <span className="text-xs opacity-80">Um cliente por vez</span>
            </div>
          </Button>

          <Button
            variant={mode === "bulk" ? "default" : "outline"}
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setMode("bulk")}
          >
            <FileSpreadsheet className="h-5 w-5" />
            <div className="flex flex-col items-center">
              <span className="font-semibold">Upload em Massa</span>
              <span className="text-xs opacity-80">Planilha Excel</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Formulário baseado no modo selecionado */}
      {mode === "single" ? (
        <SingleSubmissionForm
          service={service}
          acaoId={acaoId}
          costPrice={costPrice}
        />
      ) : (
        <ExcelUploadForm
          service={service}
          acaoId={acaoId}
          costPrice={costPrice}
        />
      )}
    </div>
  );
}
