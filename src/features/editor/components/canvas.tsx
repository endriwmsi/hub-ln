"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
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
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  // Calcular escala para caber no container mantendo proporção
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return 0.6;
      const container = containerRef.current;
      const scaleX = (container.offsetWidth - 40) / dimensions.width;
      const scaleY = (container.offsetHeight - 40) / dimensions.height;
      return Math.min(scaleX, scaleY, 0.6) * zoom;
    };

    // Calcular na primeira montagem
    setScale(calculateScale());

    // Recalcular quando dimensões ou zoom mudarem
    const handleResize = () => setScale(calculateScale());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dimensions.width, dimensions.height, zoom]);

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
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleStageInteraction}
          onTap={handleStageInteraction}
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
              width={dimensions.width}
              height={dimensions.height}
              fill={backgroundColor}
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
                  />
                );
              }

              return null;
            })}
          </Layer>

          <Layer>
            {/* Snap guides */}
            <SnapLines guides={snapGuides} dimensions={dimensions} />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
