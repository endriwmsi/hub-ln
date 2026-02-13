"use client";

import { Line } from "react-konva";
import type { SnapGuide } from "../types";

interface SnapLinesProps {
  guides: SnapGuide[];
  canvasWidth: number;
  canvasHeight: number;
}

export function SnapLines({
  guides,
  canvasWidth,
  canvasHeight,
}: SnapLinesProps) {
  // Renderizar apenas linhas ativas (magenta) durante o drag
  return (
    <>
      {guides.map((guide) => {
        if (guide.type === "vertical") {
          return (
            <Line
              key={`v-${guide.position}`}
              points={[guide.position, 0, guide.position, canvasHeight]}
              stroke="#ff00ff"
              strokeWidth={2}
              dash={[4, 6]}
              listening={false}
            />
          );
        }
        return (
          <Line
            key={`h-${guide.position}`}
            points={[0, guide.position, canvasWidth, guide.position]}
            stroke="#ff00ff"
            strokeWidth={2}
            dash={[4, 6]}
            listening={false}
          />
        );
      })}
    </>
  );
}
