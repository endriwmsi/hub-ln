"use client";

import type Konva from "konva";
import { memo, useEffect, useRef, useState } from "react";
import { Image, Transformer } from "react-konva";
import type { ImageElement } from "../types";

interface CanvasImageProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<ImageElement>) => void;
  onDragEnd: (attrs: Partial<ImageElement>) => void;
  onSnapCalculate: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => { x: number; y: number };
}

export const CanvasImage = memo(function CanvasImage({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragEnd,
  onSnapCalculate,
}: CanvasImageProps) {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    const img = new window.Image();
    img.src = element.src;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
    };
  }, [element.src]);

  return (
    <>
      <Image
        ref={imageRef}
        image={image || undefined}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        scaleX={element.scaleX}
        scaleY={element.scaleY}
        opacity={element.opacity}
        draggable={element.draggable}
        onClick={onSelect}
        onTap={onSelect}
        dragBoundFunc={(pos) => {
          const snapped = onSnapCalculate(
            pos.x,
            pos.y,
            element.width,
            element.height,
          );
          return snapped;
        }}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = isSelected ? "move" : "pointer";
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = "default";
          }
        }}
        onDragEnd={(e) => {
          onDragEnd({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          flipEnabled={false}
          keepRatio={true}
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

CanvasImage.displayName = "CanvasImage";
