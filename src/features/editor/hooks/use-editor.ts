"use client";

import { useCallback, useState } from "react";
import { uuidv7 } from "uuidv7";
import type {
  CanvasElement,
  CanvasFormat,
  EditorState,
  ImageElement,
  ShapeElement,
  ShapeType,
  SnapGuide,
  TextElement,
  TextType,
} from "../types";
import { CANVAS_FORMATS } from "../types";

const SNAP_THRESHOLD = 10;
const MARGIN_GUIDE = 100; // Guias a 100px das bordas

export function useEditor(initialFormat: CanvasFormat = "1:1") {
  const [state, setState] = useState<EditorState>({
    canvasFormat: initialFormat,
    elements: [],
    selectedElementId: null,
    history: [[]],
    historyStep: 0,
    backgroundColor: "#ffffff",
    zoom: 1,
  });

  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

  const canvasDimensions = CANVAS_FORMATS[state.canvasFormat];

  // Calcular snap lines e ajustar posição do elemento
  const calculateSnap = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const guides: SnapGuide[] = [];
      let snappedX = x;
      let snappedY = y;

      const elementCenterX = x + width / 2;
      const elementCenterY = y + height / 2;
      const elementRight = x + width;
      const elementBottom = y + height;

      // Canvas dimensions
      const canvasCenterX = canvasDimensions.width / 2;
      const canvasCenterY = canvasDimensions.height / 2;
      const canvasRight = canvasDimensions.width;
      const canvasBottom = canvasDimensions.height;

      // ===== SNAPS HORIZONTAIS (X) =====

      // Margem esquerda (x=0)
      if (Math.abs(x) < SNAP_THRESHOLD) {
        snappedX = 0;
        guides.push({ type: "vertical", position: 0 });
      }

      // Margem direita (elemento alinhado à direita)
      if (Math.abs(elementRight - canvasRight) < SNAP_THRESHOLD) {
        snappedX = canvasRight - width;
        guides.push({ type: "vertical", position: canvasRight });
      }

      // Centro horizontal do canvas
      if (Math.abs(elementCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        snappedX = canvasCenterX - width / 2;
        guides.push({ type: "vertical", position: canvasCenterX });
      }

      // Guia a 100px da margem esquerda
      if (Math.abs(x - MARGIN_GUIDE) < SNAP_THRESHOLD) {
        snappedX = MARGIN_GUIDE;
        guides.push({ type: "vertical", position: MARGIN_GUIDE });
      }

      // Guia a 100px da margem direita
      const rightGuide = canvasRight - MARGIN_GUIDE;
      if (Math.abs(elementRight - rightGuide) < SNAP_THRESHOLD) {
        snappedX = rightGuide - width;
        guides.push({ type: "vertical", position: rightGuide });
      }

      // ===== SNAPS VERTICAIS (Y) =====

      // Margem superior (y=0)
      if (Math.abs(y) < SNAP_THRESHOLD) {
        snappedY = 0;
        guides.push({ type: "horizontal", position: 0 });
      }

      // Margem inferior (elemento alinhado embaixo)
      if (Math.abs(elementBottom - canvasBottom) < SNAP_THRESHOLD) {
        snappedY = canvasBottom - height;
        guides.push({ type: "horizontal", position: canvasBottom });
      }

      // Centro vertical do canvas
      if (Math.abs(elementCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        snappedY = canvasCenterY - height / 2;
        guides.push({ type: "horizontal", position: canvasCenterY });
      }

      // Guia a 100px da margem superior
      if (Math.abs(y - MARGIN_GUIDE) < SNAP_THRESHOLD) {
        snappedY = MARGIN_GUIDE;
        guides.push({ type: "horizontal", position: MARGIN_GUIDE });
      }

      // Guia a 100px da margem inferior
      const bottomGuide = canvasBottom - MARGIN_GUIDE;
      if (Math.abs(elementBottom - bottomGuide) < SNAP_THRESHOLD) {
        snappedY = bottomGuide - height;
        guides.push({ type: "horizontal", position: bottomGuide });
      }

      setSnapGuides(guides);
      return { x: snappedX, y: snappedY };
    },
    [canvasDimensions],
  );

  // Adicionar ao histórico
  const addToHistory = useCallback((elements: CanvasElement[]) => {
    setState((prev) => ({
      ...prev,
      history: [...prev.history.slice(0, prev.historyStep + 1), elements],
      historyStep: prev.historyStep + 1,
    }));
  }, []);

  // Adicionar texto
  const addText = useCallback(
    (textType: TextType) => {
      const newText: TextElement = {
        id: uuidv7(),
        type: "text",
        textType,
        text: textType === "title" ? "Título" : "Parágrafo",
        x: canvasDimensions.width / 2 - 100,
        y: canvasDimensions.height / 2 - 25,
        width: 200,
        height: textType === "title" ? 50 : 30,
        fontSize: textType === "title" ? 48 : 24,
        fontFamily: "Arial",
        fontStyle: "normal",
        textAlign: "left",
        fill: "#000000",
        lineHeight: 1.2,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        draggable: true,
      };

      const newElements = [...state.elements, newText];
      setState((prev) => ({
        ...prev,
        elements: newElements,
        selectedElementId: newText.id,
      }));
      addToHistory(newElements);
    },
    [state.elements, canvasDimensions, addToHistory],
  );

  // Adicionar forma
  const addShape = useCallback(
    (shapeType: ShapeType) => {
      const size = 100;
      const newShape: ShapeElement = {
        id: uuidv7(),
        type: "shape",
        shapeType,
        x: canvasDimensions.width / 2 - size / 2,
        y: canvasDimensions.height / 2 - size / 2,
        width: size,
        height: shapeType === "line" ? 2 : size,
        fill: "#3b82f6",
        stroke: "#000000",
        strokeWidth: shapeType === "line" ? 2 : 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        draggable: true,
        cornerRadius: shapeType === "rect" ? 0 : undefined,
      };

      const newElements = [...state.elements, newShape];
      setState((prev) => ({
        ...prev,
        elements: newElements,
        selectedElementId: newShape.id,
      }));
      addToHistory(newElements);
    },
    [state.elements, canvasDimensions, addToHistory],
  );

  // Adicionar imagem
  const addImage = useCallback(
    (src: string, width: number, height: number) => {
      const newImage: ImageElement = {
        id: uuidv7(),
        type: "image",
        src,
        x: canvasDimensions.width / 2 - width / 2,
        y: canvasDimensions.height / 2 - height / 2,
        width,
        height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        draggable: true,
      };

      const newElements = [...state.elements, newImage];
      setState((prev) => ({
        ...prev,
        elements: newElements,
        selectedElementId: newImage.id,
      }));
      addToHistory(newElements);
    },
    [state.elements, canvasDimensions, addToHistory],
  );

  // Selecionar elemento
  const selectElement = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedElementId: id }));
    setSnapGuides([]);
  }, []);

  // Atualizar elemento (durante drag, com snap)
  const updateElement = useCallback(
    (id: string, attrs: Partial<CanvasElement>) => {
      const element = state.elements.find((el) => el.id === id);
      if (!element) return;

      // Se está movendo (x ou y mudou), aplicar snap
      if (attrs.x !== undefined || attrs.y !== undefined) {
        const x = attrs.x ?? element.x;
        const y = attrs.y ?? element.y;
        const width = attrs.width ?? element.width;
        const height = attrs.height ?? element.height;

        const snapped = calculateSnap(x, y, width, height);
        attrs = { ...attrs, x: snapped.x, y: snapped.y };
      }

      const newElements = state.elements.map((el) =>
        el.id === id ? ({ ...el, ...attrs } as CanvasElement) : el,
      );
      setState((prev) => ({ ...prev, elements: newElements }));
    },
    [state.elements, calculateSnap],
  );

  // Finalizar atualização (adiciona ao histórico)
  const finishUpdateElement = useCallback(
    (id: string, attrs: Partial<CanvasElement>) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? ({ ...el, ...attrs } as CanvasElement) : el,
      );
      setState((prev) => ({ ...prev, elements: newElements }));
      addToHistory(newElements);
      setSnapGuides([]);
    },
    [state.elements, addToHistory],
  );

  // Deletar elemento
  const deleteElement = useCallback(() => {
    if (!state.selectedElementId) return;

    const newElements = state.elements.filter(
      (el) => el.id !== state.selectedElementId,
    );
    setState((prev) => ({
      ...prev,
      elements: newElements,
      selectedElementId: null,
    }));
    addToHistory(newElements);
  }, [state.elements, state.selectedElementId, addToHistory]);

  // Alinhamento
  const alignLeft = useCallback(() => {
    if (!state.selectedElementId) return;
    finishUpdateElement(state.selectedElementId, { x: 0 });
  }, [state.selectedElementId, finishUpdateElement]);

  const alignCenter = useCallback(() => {
    if (!state.selectedElementId) return;
    const element = state.elements.find(
      (el) => el.id === state.selectedElementId,
    );
    if (!element) return;
    finishUpdateElement(state.selectedElementId, {
      x: canvasDimensions.width / 2 - element.width / 2,
    });
  }, [
    state.selectedElementId,
    state.elements,
    canvasDimensions,
    finishUpdateElement,
  ]);

  const alignRight = useCallback(() => {
    if (!state.selectedElementId) return;
    const element = state.elements.find(
      (el) => el.id === state.selectedElementId,
    );
    if (!element) return;
    finishUpdateElement(state.selectedElementId, {
      x: canvasDimensions.width - element.width,
    });
  }, [
    state.selectedElementId,
    state.elements,
    canvasDimensions,
    finishUpdateElement,
  ]);

  const alignTop = useCallback(() => {
    if (!state.selectedElementId) return;
    finishUpdateElement(state.selectedElementId, { y: 0 });
  }, [state.selectedElementId, finishUpdateElement]);

  const alignMiddle = useCallback(() => {
    if (!state.selectedElementId) return;
    const element = state.elements.find(
      (el) => el.id === state.selectedElementId,
    );
    if (!element) return;
    finishUpdateElement(state.selectedElementId, {
      y: canvasDimensions.height / 2 - element.height / 2,
    });
  }, [
    state.selectedElementId,
    state.elements,
    canvasDimensions,
    finishUpdateElement,
  ]);

  const alignBottom = useCallback(() => {
    if (!state.selectedElementId) return;
    const element = state.elements.find(
      (el) => el.id === state.selectedElementId,
    );
    if (!element) return;
    finishUpdateElement(state.selectedElementId, {
      y: canvasDimensions.height - element.height,
    });
  }, [
    state.selectedElementId,
    state.elements,
    canvasDimensions,
    finishUpdateElement,
  ]);

  // Mudar formato do canvas
  const changeFormat = useCallback((format: CanvasFormat) => {
    setState((prev) => ({
      ...prev,
      canvasFormat: format,
      // Mantém os elementos ao mudar formato
      selectedElementId: null,
    }));
  }, []);

  // Mudar cor de fundo
  const changeBackgroundColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, backgroundColor: color }));
  }, []);

  // Undo/Redo
  const undo = useCallback(() => {
    if (state.historyStep === 0) return;
    const newStep = state.historyStep - 1;
    setState((prev) => ({
      ...prev,
      elements: prev.history[newStep],
      historyStep: newStep,
      selectedElementId: null,
    }));
  }, [state.historyStep]);

  const redo = useCallback(() => {
    if (state.historyStep >= state.history.length - 1) return;
    const newStep = state.historyStep + 1;
    setState((prev) => ({
      ...prev,
      elements: prev.history[newStep],
      historyStep: newStep,
      selectedElementId: null,
    }));
  }, [state.historyStep, state.history.length]);

  // Controle de Camadas (Z-Index)
  const bringToFront = useCallback(() => {
    if (!state.selectedElementId) return;
    const index = state.elements.findIndex(
      (el) => el.id === state.selectedElementId,
    );
    if (index === -1 || index === state.elements.length - 1) return;

    const newElements = [...state.elements];
    const [element] = newElements.splice(index, 1);
    newElements.push(element);

    setState((prev) => ({ ...prev, elements: newElements }));
    addToHistory(newElements);
  }, [state.selectedElementId, state.elements, addToHistory]);

  const sendToBack = useCallback(() => {
    if (!state.selectedElementId) return;
    const index = state.elements.findIndex(
      (el) => el.id === state.selectedElementId,
    );
    if (index === -1 || index === 0) return;

    const newElements = [...state.elements];
    const [element] = newElements.splice(index, 1);
    newElements.unshift(element);

    setState((prev) => ({ ...prev, elements: newElements }));
    addToHistory(newElements);
  }, [state.selectedElementId, state.elements, addToHistory]);

  const bringForward = useCallback(() => {
    if (!state.selectedElementId) return;
    const index = state.elements.findIndex(
      (el) => el.id === state.selectedElementId,
    );
    if (index === -1 || index >= state.elements.length - 1) return;

    const newElements = [...state.elements];
    [newElements[index], newElements[index + 1]] = [
      newElements[index + 1],
      newElements[index],
    ];

    setState((prev) => ({ ...prev, elements: newElements }));
    addToHistory(newElements);
  }, [state.selectedElementId, state.elements, addToHistory]);

  const sendBackward = useCallback(() => {
    if (!state.selectedElementId) return;
    const index = state.elements.findIndex(
      (el) => el.id === state.selectedElementId,
    );
    if (index === -1 || index === 0) return;

    const newElements = [...state.elements];
    [newElements[index], newElements[index - 1]] = [
      newElements[index - 1],
      newElements[index],
    ];

    setState((prev) => ({ ...prev, elements: newElements }));
    addToHistory(newElements);
  }, [state.selectedElementId, state.elements, addToHistory]);

  const selectedElement = state.elements.find(
    (el) => el.id === state.selectedElementId,
  );

  return {
    // State
    elements: state.elements,
    selectedElement,
    canvasFormat: state.canvasFormat,
    canvasDimensions,
    backgroundColor: state.backgroundColor,
    zoom: state.zoom,
    snapGuides,
    canUndo: state.historyStep > 0,
    canRedo: state.historyStep < state.history.length - 1,

    // Actions
    addText,
    addShape,
    addImage,
    selectElement,
    updateElement,
    finishUpdateElement,
    deleteElement,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    changeFormat,
    changeBackgroundColor,
    undo,
    redo,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  };
}
