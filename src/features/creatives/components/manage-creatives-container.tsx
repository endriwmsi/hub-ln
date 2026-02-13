"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { CreativesGrid } from "./creatives-grid";
import { UploadCreativeForm } from "./upload-creative-form";

export function ManageCreativesContainer() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gerenciar Criativos
          </h1>
          <p className="text-muted-foreground">
            Faça upload de criativos para seus clientes
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Criativo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Criativo</DialogTitle>
              <DialogDescription>
                Faça upload de um novo criativo para seus clientes
              </DialogDescription>
            </DialogHeader>
            <UploadCreativeForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <CreativesGrid isAdmin />
    </div>
  );
}
