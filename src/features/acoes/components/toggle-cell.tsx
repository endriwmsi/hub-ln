"use client";

import type { Acao } from "@/core/db/schema";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import { useToggleAcaoField } from "../hooks/use-toggle-acao-field";

type ToggleCellProps = {
  acao: Acao;
  field: "visivel" | "permiteEnvios";
};

export function ToggleCell({ acao, field }: ToggleCellProps) {
  const { mutate: toggleField, isPending } = useToggleAcaoField();

  const currentValue = acao[field];

  const handleToggle = (checked: boolean) => {
    toggleField({ id: acao.id, field, value: checked });
  };

  return (
    <div className="flex items-center justify-center">
      <Switch
        className={cn(currentValue ? "bg-green-400" : "bg-red-400")}
        checked={currentValue}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
    </div>
  );
}
