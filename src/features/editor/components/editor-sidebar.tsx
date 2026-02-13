"use client";

import {
  Circle,
  Download,
  Image as ImageIcon,
  Minus,
  Palette,
  Redo2,
  Save,
  Square,
  Triangle,
  Type,
  Undo2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { CanvasFormat } from "../types";
import { ColorPicker } from "./color-picker";
import { FormatSelector } from "./format-selector";

interface EditorSidebarProps {
  format: CanvasFormat;
  backgroundColor: string;
  canUndo: boolean;
  canRedo: boolean;
  onFormatChange: (format: CanvasFormat) => void;
  onBackgroundColorChange: (color: string) => void;
  onAddText: (type: "title" | "paragraph") => void;
  onAddShape: (type: "rect" | "circle" | "triangle" | "line") => void;
  onAddImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
}

export function EditorSidebar({
  format,
  backgroundColor,
  canUndo,
  canRedo,
  onFormatChange,
  onBackgroundColorChange,
  onAddText,
  onAddShape,
  onAddImage,
  onUndo,
  onRedo,
  onSave,
  onExport,
}: EditorSidebarProps) {
  return (
    <div className="w-14 flex flex-col items-center gap-1 p-2 bg-background/80 backdrop-blur-lg border rounded-lg shadow-lg">
      <TooltipProvider delayDuration={300}>
        {/* Formato Canvas */}
        <div className="w-full">
          <FormatSelector format={format} onChange={onFormatChange} />
        </div>

        <Separator className="my-1" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="w-9 h-9"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Desfazer</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="w-9 h-9"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Refazer</TooltipContent>
        </Tooltip>

        <Separator className="my-1" />

        {/* Texto */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddText("title")}
              className="w-9 h-9"
            >
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Adicionar Título</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddText("paragraph")}
              className="w-9 h-9"
            >
              <Type className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Adicionar Parágrafo</TooltipContent>
        </Tooltip>

        <Separator className="my-1" />

        {/* Formas */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddShape("rect")}
              className="w-9 h-9"
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Retângulo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddShape("circle")}
              className="w-9 h-9"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Círculo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddShape("triangle")}
              className="w-9 h-9"
            >
              <Triangle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Triângulo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddShape("line")}
              className="w-9 h-9"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Linha</TooltipContent>
        </Tooltip>

        <Separator className="my-1" />

        {/* Imagem */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddImage}
              className="w-9 h-9"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Adicionar Imagem</TooltipContent>
        </Tooltip>

        <Separator className="my-1" />

        {/* Background Color */}
        <div className="space-y-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 w-full hover:opacity-80 transition-opacity"
              >
                <Palette className="h-3 w-3 text-muted-foreground" />
                <div
                  className="w-8 h-8 rounded-md border-2 cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor }}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-auto p-3">
              <div className="space-y-2">
                <Label className="text-xs">Cor de Fundo</Label>
                <ColorPicker
                  color={backgroundColor}
                  onChange={onBackgroundColorChange}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1" />

        <Separator className="my-1" />

        {/* Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="w-9 h-9"
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Exportar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              onClick={onSave}
              className="w-9 h-9"
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Salvar</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
