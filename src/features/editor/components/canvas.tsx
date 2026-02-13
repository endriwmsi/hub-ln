"use client";

import type Konva from "konva";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import type { CanvasDimensions, CanvasElement, SnapGuide } from "../types";
import { CanvasImage } from "./canvas-image";
import { CanvasShape } from "./canvas-shape";
import { CanvasText } from "./canvas-text";
import { SnapLines } from "./snap-lines";

interface CanvasProps {
  dimensions: CanvasDimensions;
  elements: CanvasElement[];
  selectedId: string | null;
  backgroundColor: string;
  zoom: number;
  snapGuides: SnapGuide[];
  onSelect: (id: string | null) => void;
  onElementChange: (id: string, attrs: Partial<CanvasElement>) => void;
  onDragEnd: (id: string, attrs: Partial<CanvasElement>) => void;
  onSnapCalculate: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => { x: number; y: number };
  onDelete?: () => void;
  onExportReady?: (exportFn: () => void) => void;
}

export function Canvas({
  dimensions,
  elements,
  selectedId,
  backgroundColor,
  zoom,
  snapGuides,
  onSelect,
  onElementChange,
  onDragEnd,
  onSnapCalculate,
  onDelete,
  onExportReady,
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  // Memoizar as dimensões para evitar recriações desnecessárias
  const stableDimensions = useMemo(
    () => ({ width: dimensions.width, height: dimensions.height }),
    [dimensions.width, dimensions.height],
  );

  // Calcular escala para caber no container mantendo proporção
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return 0.6;
      const container = containerRef.current;
      const scaleX = (container.offsetWidth - 40) / stableDimensions.width;
      const scaleY = (container.offsetHeight - 40) / stableDimensions.height;
      return Math.min(scaleX, scaleY, 0.6) * zoom;
    };

    // Calcular na primeira montagem
    setScale(calculateScale());

    // Recalcular quando dimensões ou zoom mudarem
    const handleResize = () => setScale(calculateScale());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [stableDimensions.width, stableDimensions.height, zoom]);

  // Expor função de export
  useEffect(() => {
    if (!onExportReady || !stageRef.current) return;

    const exportImage = () => {
      const stage = stageRef.current;
      if (!stage) return;

      // Desselecionar elemento para remover transformer
      onSelect(null);

      // Aguardar próximo frame para garantir que transformer foi removido
      setTimeout(() => {
        if (!stage) return;

        // Gerar imagem do canvas
        const dataURL = stage.toDataURL({
          pixelRatio: 2, // Maior qualidade
          mimeType: "image/png",
        });

        // Criar link de download
        const link = document.createElement("a");
        link.download = `criativo-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 100);
    };

    onExportReady(exportImage);
  }, [onExportReady, onSelect]);

  // Listener para tecla Delete/Backspace
  useEffect(() => {
    if (!onDelete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar se não está editando texto em um input/textarea
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Se tem elemento selecionado e não está editando, deletar ao pressionar Delete ou Backspace
      if (
        selectedId &&
        !isEditing &&
        (e.key === "Delete" || e.key === "Backspace")
      ) {
        e.preventDefault();
        onDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, onDelete]);

  // Click/Tap no stage para desselecionar
  const handleStageInteraction = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full bg-muted/20 overflow-hidden"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Stage
          key="editor-stage"
          ref={stageRef}
          width={stableDimensions.width}
          height={stableDimensions.height}
          onClick={handleStageInteraction}
          onTap={handleStageInteraction}
          onMouseMove={(e) => {
            const container = e.target.getStage()?.container();
            if (container && !e.target.attrs.draggable) {
              container.style.cursor = "default";
            }
          }}
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={stableDimensions.width}
              height={stableDimensions.height}
              fill={backgroundColor}
              listening={false}
            />
          </Layer>

          <Layer>
            {/* Render elements */}
            {elements.map((element) => {
              const isSelected = element.id === selectedId;

              if (element.type === "text") {
                return (
                  <CanvasText
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={(attrs) => onElementChange(element.id, attrs)}
                    onDragEnd={(attrs) => onDragEnd(element.id, attrs)}
                    onSnapCalculate={onSnapCalculate}
                  />
                );
              }

              if (element.type === "shape") {
                return (
                  <CanvasShape
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={(attrs) => onElementChange(element.id, attrs)}
                    onDragEnd={(attrs) => onDragEnd(element.id, attrs)}
                    onSnapCalculate={onSnapCalculate}
                  />
                );
              }

              if (element.type === "image") {
                return (
                  <CanvasImage
                    key={element.id}
                    element={element}
                    isSelected={isSelected}
                    onSelect={() => onSelect(element.id)}
                    onChange={(attrs) => onElementChange(element.id, attrs)}
                    onDragEnd={(attrs) => onDragEnd(element.id, attrs)}
                    onSnapCalculate={onSnapCalculate}
                  />
                );
              }

              return null;
            })}
          </Layer>

          <Layer>
            {/* Snap lines - sempre acima dos elementos */}
            <SnapLines
              guides={snapGuides}
              canvasWidth={stableDimensions.width}
              canvasHeight={stableDimensions.height}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
