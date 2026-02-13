"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Canvas,
  EditorSidebar,
  ImageUpload,
  PropertiesPanel,
  useEditor,
} from "@/features/editor";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export default function EditorPage() {
  const editor = useEditor("1:1");
  const [creativeName, setCreativeName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleSave = () => {
    if (!creativeName.trim()) {
      toast.error("Por favor, digite um nome para o criativo");
      return;
    }

    // TODO: Implementar salvamento no backend
    toast.success(`Criativo "${creativeName}" salvo com sucesso!`);
    setSaveDialogOpen(false);
  };

  const handleExport = () => {
    // TODO: Implementar exportação/download
    toast.success("Exportando criativo...");
  };

  return (
    <div className="h-screen flex bg-linear-to-br from-background via-muted/20 to-background relative overflow-hidden p-8">
      {/* Dot Pattern Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <EditorSidebar
          format={editor.canvasFormat}
          backgroundColor={editor.backgroundColor}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onFormatChange={editor.changeFormat}
          onBackgroundColorChange={editor.changeBackgroundColor}
          onAddText={editor.addText}
          onAddShape={editor.addShape}
          onAddImage={() => {
            document.getElementById("image-upload-trigger")?.click();
          }}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onSave={() => setSaveDialogOpen(true)}
          onExport={handleExport}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div>
            <Canvas
              dimensions={editor.canvasDimensions}
              elements={editor.elements}
              selectedId={editor.selectedElement?.id || null}
              backgroundColor={editor.backgroundColor}
              zoom={editor.zoom}
              snapGuides={editor.snapGuides}
              onSelect={editor.selectElement}
              onElementChange={editor.updateElement}
              onDragEnd={editor.finishUpdateElement}
            />
          </div>
        </div>

        {/* Properties Panel */}
        <div className="bg-background/80 backdrop-blur-lg border-l shadow-lg">
          <PropertiesPanel
            selectedElement={editor.selectedElement || null}
            canvasDimensions={editor.canvasDimensions}
            onUpdate={(attrs) => {
              if (editor.selectedElement) {
                editor.updateElement(editor.selectedElement.id, attrs);
              }
            }}
            onDelete={editor.deleteElement}
            onAlignLeft={editor.alignLeft}
            onAlignCenter={editor.alignCenter}
            onAlignRight={editor.alignRight}
            onAlignTop={editor.alignTop}
            onAlignMiddle={editor.alignMiddle}
            onAlignBottom={editor.alignBottom}
            onBringToFront={editor.bringToFront}
            onSendToBack={editor.sendToBack}
            onBringForward={editor.bringForward}
            onSendBackward={editor.sendBackward}
          />
        </div>
      </div>

      {/* Hidden Image Upload Trigger */}
      <div className="hidden">
        <ImageUpload
          onUpload={editor.addImage}
          trigger={
            <button type="button" id="image-upload-trigger">
              Upload
            </button>
          }
        />
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Criativo</DialogTitle>
            <DialogDescription>
              Digite um nome para o seu criativo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome do Criativo</Label>
              <Input
                id="name"
                value={creativeName}
                onChange={(e) => setCreativeName(e.target.value)}
                placeholder="Ex: Post Instagram - Promoção"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
