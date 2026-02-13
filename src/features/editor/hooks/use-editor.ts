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

const SNAP_THRESHOLD = 15; // Aumentado para melhor usabilidade
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
      const snapPointsX: Array<{
        pos: number;
        guidePos: number;
        distance: number;
      }> = [];

      // Margem esquerda (x=0)
      const distToLeft = Math.abs(x);
      if (distToLeft < SNAP_THRESHOLD) {
        snapPointsX.push({ pos: 0, guidePos: 0, distance: distToLeft });
      }

      // Margem direita (elemento alinhado à direita)
      const distToRight = Math.abs(elementRight - canvasRight);
      if (distToRight < SNAP_THRESHOLD) {
        snapPointsX.push({
          pos: canvasRight - width,
          guidePos: canvasRight,
          distance: distToRight,
        });
      }

      // Centro horizontal do canvas
      const distToCenterX = Math.abs(elementCenterX - canvasCenterX);
      if (distToCenterX < SNAP_THRESHOLD) {
        snapPointsX.push({
          pos: canvasCenterX - width / 2,
          guidePos: canvasCenterX,
          distance: distToCenterX,
        });
      }

      // Guia a 100px da margem esquerda
      const distToLeftGuide = Math.abs(x - MARGIN_GUIDE);
      if (distToLeftGuide < SNAP_THRESHOLD) {
        snapPointsX.push({
          pos: MARGIN_GUIDE,
          guidePos: MARGIN_GUIDE,
          distance: distToLeftGuide,
        });
      }

      // Guia a 100px da margem direita
      const rightGuide = canvasRight - MARGIN_GUIDE;
      const distToRightGuide = Math.abs(elementRight - rightGuide);
      if (distToRightGuide < SNAP_THRESHOLD) {
        snapPointsX.push({
          pos: rightGuide - width,
          guidePos: rightGuide,
          distance: distToRightGuide,
        });
      }

      // Escolher o snap X mais próximo
      if (snapPointsX.length > 0) {
        const closestX = snapPointsX.reduce((prev, curr) =>
          curr.distance < prev.distance ? curr : prev,
        );
        snappedX = closestX.pos;
        guides.push({ type: "vertical", position: closestX.guidePos });
      }

      // ===== SNAPS VERTICAIS (Y) =====
      const snapPointsY: Array<{
        pos: number;
        guidePos: number;
        distance: number;
      }> = [];

      // Margem superior (y=0)
      const distToTop = Math.abs(y);
      if (distToTop < SNAP_THRESHOLD) {
        snapPointsY.push({ pos: 0, guidePos: 0, distance: distToTop });
      }

      // Margem inferior (elemento alinhado embaixo)
      const distToBottom = Math.abs(elementBottom - canvasBottom);
      if (distToBottom < SNAP_THRESHOLD) {
        snapPointsY.push({
          pos: canvasBottom - height,
          guidePos: canvasBottom,
          distance: distToBottom,
        });
      }

      // Centro vertical do canvas
      const distToCenterY = Math.abs(elementCenterY - canvasCenterY);
      if (distToCenterY < SNAP_THRESHOLD) {
        snapPointsY.push({
          pos: canvasCenterY - height / 2,
          guidePos: canvasCenterY,
          distance: distToCenterY,
        });
      }

      // Guia a 100px da margem superior
      const distToTopGuide = Math.abs(y - MARGIN_GUIDE);
      if (distToTopGuide < SNAP_THRESHOLD) {
        snapPointsY.push({
          pos: MARGIN_GUIDE,
          guidePos: MARGIN_GUIDE,
          distance: distToTopGuide,
        });
      }

      // Guia a 100px da margem inferior
      const bottomGuide = canvasBottom - MARGIN_GUIDE;
      const distToBottomGuide = Math.abs(elementBottom - bottomGuide);
      if (distToBottomGuide < SNAP_THRESHOLD) {
        snapPointsY.push({
          pos: bottomGuide - height,
          guidePos: bottomGuide,
          distance: distToBottomGuide,
        });
      }

      // Escolher o snap Y mais próximo
      if (snapPointsY.length > 0) {
        const closestY = snapPointsY.reduce((prev, curr) =>
          curr.distance < prev.distance ? curr : prev,
        );
        snappedY = closestY.pos;
        guides.push({ type: "horizontal", position: closestY.guidePos });
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

  // Atualizar elemento (para transform, cor, etc - não para drag)
  const updateElement = useCallback(
    (id: string, attrs: Partial<CanvasElement>) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? ({ ...el, ...attrs } as CanvasElement) : el,
      );
      setState((prev) => ({ ...prev, elements: newElements }));
    },
    [state.elements],
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
    calculateSnap,
  };
}
