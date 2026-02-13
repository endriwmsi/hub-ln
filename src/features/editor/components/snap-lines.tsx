"use client";

import { Line } from "react-konva";
import type { CanvasDimensions, SnapGuide } from "../types";

interface SnapLinesProps {
  guides: SnapGuide[];
  dimensions: CanvasDimensions;
}

export function SnapLines({ guides, dimensions }: SnapLinesProps) {
  return (
    <>
      {guides.map((guide) => {
        if (guide.type === "vertical") {
          return (
            <Line
              key={`v-${guide.position}`}
              points={[guide.position, 0, guide.position, dimensions.height]}
              stroke="#ff00ff"
              strokeWidth={1}
              dash={[4, 6]}
            />
          );
        }
        return (
          <Line
            key={`h-${guide.position}`}
            points={[0, guide.position, dimensions.width, guide.position]}
            stroke="#ff00ff"
            strokeWidth={1}
            dash={[4, 6]}
          />
        );
      })}
    </>
  );
}
