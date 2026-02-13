"use client";

import type Konva from "konva";
import { memo, useEffect, useRef, useState } from "react";
import { Text, Transformer } from "react-konva";
import type { TextElement } from "../types";

interface CanvasTextProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<TextElement>) => void;
  onDragEnd: (attrs: Partial<TextElement>) => void;
  onSnapCalculate: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => { x: number; y: number };
}

export const CanvasText = memo(function CanvasText({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragEnd,
  onSnapCalculate,
}: CanvasTextProps) {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);
  const lastHeightRef = useRef<number>(element.height);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Recalcular altura automaticamente após cada render
  // biome-ignore lint/correctness/useExhaustiveDependencies: Não incluir onChange para evitar loop infinito
  useEffect(() => {
    const node = textRef.current;
    if (!node) return;

    // Cancelar animação anterior se existir
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Aguardar próximo frame para garantir que o Konva renderizou
    rafRef.current = requestAnimationFrame(() => {
      const calculatedHeight = node.height();

      // Só atualizar se a altura for diferente E maior que 0 E diferente do último valor
      if (
        calculatedHeight > 0 &&
        Math.abs(calculatedHeight - element.height) > 1 &&
        Math.abs(calculatedHeight - lastHeightRef.current) > 1
      ) {
        lastHeightRef.current = calculatedHeight;
        onChange({ height: calculatedHeight });
      }
    });

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    element.text,
    element.width,
    element.fontSize,
    element.lineHeight,
    element.fontFamily,
    element.fontStyle,
  ]);

  // Atualizar transformer quando altura mudar
  // biome-ignore lint/correctness/useExhaustiveDependencies: Altura precisa ser observada para atualizar a caixa de seleção
  useEffect(() => {
    if (isSelected && transformerRef.current) {
      transformerRef.current.forceUpdate();
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [element.height, isSelected]);

  const updateTextHeight = (newText: string) => {
    const node = textRef.current;
    if (!node) return;

    // Temporariamente atualizar o texto para medir a altura
    const oldText = node.text();
    node.text(newText);
    const newHeight = node.height();
    node.text(oldText);

    onChange({ text: newText, height: newHeight });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    const textNode = textRef.current;
    if (!textNode) return;

    const stage = textNode.getStage();
    const container = stage?.container();
    if (!stage || !container) return;

    // Criar textarea para edição
    const textarea = document.createElement("textarea");
    container.appendChild(textarea);

    // Pegar posição absoluta do texto no canvas Konva
    const textPosition = textNode.absolutePosition();

    // Pegar a posição do container do stage
    const stageBox = container.getBoundingClientRect();

    // Calcular o scale CSS aplicado ao stage (via transform do parent)
    const stageParent = container.parentElement;
    let cssScale = 1;
    if (stageParent) {
      const transform = window.getComputedStyle(stageParent).transform;
      if (transform && transform !== "none") {
        const matrix = transform.match(/matrix\((.+)\)/);
        if (matrix) {
          const values = matrix[1].split(", ");
          cssScale = Number.parseFloat(values[0]);
        }
      }
    }

    // Aplicar transformação considerando a escala CSS
    const areaPosition = {
      x: stageBox.left + textPosition.x * cssScale,
      y: stageBox.top + textPosition.y * cssScale,
    };

    textarea.value = element.text;
    textarea.style.position = "absolute";
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${element.width * cssScale}px`;
    textarea.style.fontSize = `${element.fontSize * cssScale}px`;
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.transformOrigin = "left top";
    textarea.style.zIndex = "1000";

    // Auto-ajustar altura do textarea conforme digita
    const adjustTextareaHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.focus();
    textarea.select();
    adjustTextareaHeight();

    // Declarar handlers com let para permitir referências
    let handleKeyDown: (e: KeyboardEvent) => void;
    let handleBlur: () => void;
    let handleOutsideClick: (e: MouseEvent) => void;

    // Definir removeTextarea primeiro
    let isRemoving = false;
    const removeTextarea = () => {
      if (isRemoving) return;
      isRemoving = true;

      // Remover event listeners antes de remover textarea
      if (handleOutsideClick) {
        window.removeEventListener("click", handleOutsideClick);
      }
      if (handleKeyDown) {
        textarea.removeEventListener("keydown", handleKeyDown);
      }
      if (handleBlur) {
        textarea.removeEventListener("blur", handleBlur);
      }
      textarea.removeEventListener("input", adjustTextareaHeight);

      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
      setIsEditing(false);
    };

    // Definir os handlers
    handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        removeTextarea();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        updateTextHeight(textarea.value);
        removeTextarea();
      }
    };

    handleBlur = () => {
      updateTextHeight(textarea.value);
      removeTextarea();
    };

    handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Verificar se o clique foi fora da textarea
      if (target !== textarea && !textarea.contains(target)) {
        updateTextHeight(textarea.value);
        removeTextarea();
      }
    };

    // Adicionar event listeners
    textarea.addEventListener("input", adjustTextareaHeight);
    textarea.addEventListener("keydown", handleKeyDown);
    textarea.addEventListener("blur", handleBlur);

    setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
    }, 100);
  };

  // Desestruturar element removendo height para permitir expansão automática
  const { height: _height, ...textProps } = element;

  return (
    <>
      <Text
        ref={textRef}
        {...textProps}
        // Não passar height - deixar Konva calcular automaticamente com wrap
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        draggable={element.draggable && !isEditing}
        wrap="word"
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
          const node = textRef.current;
          if (!node) return;

          const scaleX = node.scaleX();

          // Reset scale e atualizar largura
          node.scaleX(1);
          node.scaleY(1);

          const newWidth = Math.max(20, node.width() * scaleX);

          // Temporariamente aplicar nova largura para medir altura
          const oldWidth = node.width();
          node.width(newWidth);
          const newHeight = node.height();
          node.width(oldWidth);

          // Atualizar largura e altura recalculada
          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !isEditing && (
        <Transformer
          ref={transformerRef}
          flipEnabled={false}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limitar largura mínima
            if (Math.abs(newBox.width) < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
});

CanvasText.displayName = "CanvasText";
