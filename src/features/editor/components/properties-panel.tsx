"use client";

import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Slider } from "@/shared/components/ui/slider";
import type { CanvasDimensions, CanvasElement } from "../types";
import { ColorPicker } from "./color-picker";

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null;
  canvasDimensions: CanvasDimensions;
  onUpdate: (attrs: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignMiddle: () => void;
  onAlignBottom: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export function PropertiesPanel({
  selectedElement,
  onUpdate,
  onDelete,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
}: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="w-80 border rounded-lg bg-background p-4">
        <p className="text-sm text-muted-foreground">
          Selecione um elemento para editar suas propriedades
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-80 border rounded-lg bg-background h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Propriedades</h3>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <Separator />

        {/* Alinhamento */}
        <div>
          <Label className="text-xs text-muted-foreground">Alinhamento</Label>
          <div className="grid grid-cols-3 gap-1 mt-2">
            <Button variant="outline" size="sm" onClick={onAlignLeft}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onAlignCenter}>
              <AlignHorizontalDistributeCenter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onAlignRight}>
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onAlignTop}>
              <AlignVerticalDistributeCenter className="h-4 w-4 rotate-90" />
            </Button>
            <Button variant="outline" size="sm" onClick={onAlignMiddle}>
              <AlignCenter className="h-4 w-4 rotate-90" />
            </Button>
            <Button variant="outline" size="sm" onClick={onAlignBottom}>
              <AlignVerticalDistributeCenter className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Camadas (Z-Index) */}
        <div>
          <Label className="text-xs text-muted-foreground">Camadas</Label>
          <div className="grid grid-cols-2 gap-1 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBringToFront}
              className="text-xs"
            >
              <ChevronsUp className="h-3 w-3 mr-1" />
              Trazer frente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSendToBack}
              className="text-xs"
            >
              <ChevronsDown className="h-3 w-3 mr-1" />
              Enviar trás
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBringForward}
              className="text-xs"
            >
              <ArrowUp className="h-3 w-3 mr-1" />
              Avançar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSendBackward}
              className="text-xs"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Recuar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Posição */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Posição</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x" className="text-xs">
                X
              </Label>
              <Input
                id="x"
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="y" className="text-xs">
                Y
              </Label>
              <Input
                id="y"
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Tamanho */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tamanho</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width" className="text-xs">
                Largura
              </Label>
              <Input
                id="width"
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs">
                Altura
              </Label>
              <Input
                id="height"
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Rotação */}
        <div className="space-y-2">
          <Label htmlFor="rotation" className="text-xs text-muted-foreground">
            Rotação: {Math.round(selectedElement.rotation)}°
          </Label>
          <Slider
            id="rotation"
            min={0}
            max={360}
            step={1}
            value={[selectedElement.rotation]}
            onValueChange={([value]) => onUpdate({ rotation: value })}
          />
        </div>

        {/* Opacidade */}
        <div className="space-y-2">
          <Label htmlFor="opacity" className="text-xs text-muted-foreground">
            Opacidade: {Math.round(selectedElement.opacity * 100)}%
          </Label>
          <Slider
            id="opacity"
            min={0}
            max={1}
            step={0.01}
            value={[selectedElement.opacity]}
            onValueChange={([value]) => onUpdate({ opacity: value })}
          />
        </div>

        <Separator />

        {/* Propriedades específicas de texto */}
        {selectedElement.type === "text" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="text" className="text-xs text-muted-foreground">
                Texto
              </Label>
              <Input
                id="text"
                value={selectedElement.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fontSize"
                className="text-xs text-muted-foreground"
              >
                Tamanho da Fonte
              </Label>
              <Input
                id="fontSize"
                type="number"
                value={selectedElement.fontSize}
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fontStyle"
                className="text-xs text-muted-foreground"
              >
                Estilo
              </Label>
              <Select
                value={selectedElement.fontStyle}
                onValueChange={(value: "normal" | "bold" | "italic") =>
                  onUpdate({ fontStyle: value })
                }
              >
                <SelectTrigger id="fontStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Negrito</SelectItem>
                  <SelectItem value="italic">Itálico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="textAlign"
                className="text-xs text-muted-foreground"
              >
                Alinhamento de Texto
              </Label>
              <div className="flex gap-1">
                <Button
                  variant={
                    selectedElement.textAlign === "left" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onUpdate({ textAlign: "left" })}
                  className="flex-1"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    selectedElement.textAlign === "center"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => onUpdate({ textAlign: "center" })}
                  className="flex-1"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    selectedElement.textAlign === "right"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => onUpdate({ textAlign: "right" })}
                  className="flex-1"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Cor</Label>
              <ColorPicker
                color={selectedElement.fill}
                onChange={(color) => onUpdate({ fill: color })}
              />
            </div>
          </>
        )}

        {/* Propriedades específicas de forma */}
        {selectedElement.type === "shape" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Cor de Preenchimento
              </Label>
              <ColorPicker
                color={selectedElement.fill}
                onChange={(color) => onUpdate({ fill: color })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Cor da Borda
              </Label>
              <ColorPicker
                color={selectedElement.stroke}
                onChange={(color) => onUpdate({ stroke: color })}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="strokeWidth"
                className="text-xs text-muted-foreground"
              >
                Espessura da Borda
              </Label>
              <Input
                id="strokeWidth"
                type="number"
                min={0}
                value={selectedElement.strokeWidth}
                onChange={(e) =>
                  onUpdate({ strokeWidth: Number(e.target.value) })
                }
              />
            </div>

            {selectedElement.shapeType === "rect" && (
              <div className="space-y-2">
                <Label
                  htmlFor="cornerRadius"
                  className="text-xs text-muted-foreground"
                >
                  Arredondamento
                </Label>
                <Input
                  id="cornerRadius"
                  type="number"
                  min={0}
                  value={selectedElement.cornerRadius || 0}
                  onChange={(e) =>
                    onUpdate({ cornerRadius: Number(e.target.value) })
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
