export type CanvasFormat = "9:16" | "1:1" | "3:4";

export interface CanvasDimensions {
  width: number;
  height: number;
}

export const CANVAS_FORMATS: Record<CanvasFormat, CanvasDimensions> = {
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "3:4": { width: 1080, height: 1350 },
};

export type ElementType = "text" | "shape" | "image";

export type ShapeType = "rect" | "circle" | "triangle" | "line";

export type TextType = "title" | "paragraph";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  draggable: boolean;
}

export interface TextElement extends BaseElement {
  type: "text";
  textType: TextType;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: "normal" | "bold" | "italic";
  textAlign: "left" | "center" | "right";
  fill: string;
  lineHeight: number;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  imageObj?: HTMLImageElement;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export interface EditorState {
  canvasFormat: CanvasFormat;
  elements: CanvasElement[];
  selectedElementId: string | null;
  history: CanvasElement[][];
  historyStep: number;
  backgroundColor: string;
  zoom: number;
}

export interface SnapGuide {
  type: "vertical" | "horizontal";
  position: number;
}
