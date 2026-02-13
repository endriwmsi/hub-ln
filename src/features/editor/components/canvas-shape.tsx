"use client";

import type Konva from "konva";
import { memo, useEffect, useRef } from "react";
import { Circle, Line, Rect, RegularPolygon, Transformer } from "react-konva";
import type { ShapeElement } from "../types";

interface CanvasShapeProps {
  element: ShapeElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<ShapeElement>) => void;
  onDragEnd: (attrs: Partial<ShapeElement>) => void;
  onSnapCalculate: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => { x: number; y: number };
}

export const CanvasShape = memo(function CanvasShape({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragEnd,
  onSnapCalculate,
}: CanvasShapeProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Konva shapes têm tipos diferentes dependendo do shapeType
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    ref: shapeRef,
    x: element.x,
    y: element.y,
    fill: element.fill,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
    rotation: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    opacity: element.opacity,
    draggable: element.draggable,
    onClick: onSelect,
    onTap: onSelect,
    dragBoundFunc: (pos: { x: number; y: number }) => {
      const snapped = onSnapCalculate(
        pos.x,
        pos.y,
        element.width,
        element.height,
      );
      return snapped;
    },
    onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
      const container = e.target.getStage()?.container();
      if (container) {
        container.style.cursor = isSelected ? "move" : "pointer";
      }
    },
    onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
      const container = e.target.getStage()?.container();
      if (container) {
        container.style.cursor = "default";
      }
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd({
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: () => {
      const node = shapeRef.current;
      if (!node) return;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale
      node.scaleX(1);
      node.scaleY(1);

      onChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(5, element.width * scaleX),
        height: Math.max(5, element.height * scaleY),
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1,
      });
    },
  };

  const renderShape = () => {
    switch (element.shapeType) {
      case "rect":
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            cornerRadius={element.cornerRadius}
          />
        );
      case "circle":
        return (
          <Circle
            {...commonProps}
            radius={Math.min(element.width, element.height) / 2}
          />
        );
      case "triangle":
        return (
          <RegularPolygon
            {...commonProps}
            sides={3}
            radius={Math.min(element.width, element.height) / 2}
          />
        );
      case "line":
        return (
          <Line
            {...commonProps}
            points={[0, 0, element.width, 0]}
            strokeWidth={element.strokeWidth || 2}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // Limitar tamanho mínimo
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
});

CanvasShape.displayName = "CanvasShape";
