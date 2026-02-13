"use client";

import { Loader2 } from "lucide-react";
import { useCreatives } from "../hooks";
import { CreativeCard } from "./creative-card";

interface CreativesGridProps {
  isAdmin?: boolean;
}

export function CreativesGrid({ isAdmin = false }: CreativesGridProps) {
  const { data: creatives, isLoading, error } = useCreatives();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Erro ao carregar criativos. Tente novamente.
        </p>
      </div>
    );
  }

  if (!creatives || creatives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhum criativo disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {creatives.map((creative) => (
        <CreativeCard key={creative.id} creative={creative} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
