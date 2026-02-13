"use client";

import {
  Circle,
  Image as ImageIcon,
  Minus,
  Square,
  Triangle,
  Type,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface ToolbarProps {
  onAddText: (type: "title" | "paragraph") => void;
  onAddShape: (type: "rect" | "circle" | "triangle" | "line") => void;
  onAddImage: () => void;
}

export function Toolbar({ onAddText, onAddShape, onAddImage }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 border-b bg-background h-[calc(100vh-120px)]">
      <TooltipProvider delayDuration={300}>
        {/* Texto */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddText("title")}
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar Título</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddText("paragraph")}
              >
                <Type className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar Parágrafo</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Formas */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddShape("rect")}
              >
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar Retângulo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddShape("circle")}
              >
                <Circle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar Círculo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddShape("triangle")}
              >
                <Triangle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar Triângulo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddShape("line")}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar Linha</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Imagem */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAddImage}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Adicionar Imagem</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
