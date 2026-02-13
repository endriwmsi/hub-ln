"use client";

import { IconAspectRatio } from "@tabler/icons-react";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { CanvasFormat } from "../types";
import { CANVAS_FORMATS } from "../types";

interface FormatSelectorProps {
  format: CanvasFormat;
  onChange: (format: CanvasFormat) => void;
}

export function FormatSelector({ format, onChange }: FormatSelectorProps) {
  const formatInfo = CANVAS_FORMATS[format];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <IconAspectRatio className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-64 p-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Formato do Canvas
          </Label>
          <Select value={format} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9:16">Stories (9:16)</SelectItem>
              <SelectItem value="1:1">Feed Quadrado (1:1)</SelectItem>
              <SelectItem value="3:4">Feed Vertical (3:4)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {formatInfo.width}x{formatInfo.height}px
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
