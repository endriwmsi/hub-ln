"use client";

import type Konva from "konva";
import { useEffect, useRef } from "react";
import { Text, Transformer } from "react-konva";
import type { TextElement } from "../types";

interface CanvasTextProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<TextElement>) => void;
  onDragEnd: (attrs: Partial<TextElement>) => void;
}

export function CanvasText({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragEnd,
}: CanvasTextProps) {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        {...element}
        onClick={onSelect}
        onTap={onSelect}
        draggable={element.draggable}
        onDragEnd={(e) => {
          onDragEnd({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = textRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale and update width/height
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
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
}
