'use client';
import { useEffect, useMemo, useRef } from 'react';
import { EditorPanel } from './editor-panel';
import { useSize } from '@/hooks/useSize';
import { PreviewRenderer } from '@/renderer/PreviewRenderer';

export function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  const canvasSize = useMemo(() => {
    const PADDING = 10;
    if (size.width === 0 || size.height === 0) {
      return { width: 0, height: 0 };
    }

    const aspectRatio = 16 / 9;
    const result = {
      width: size.width - PADDING,
      height: size.width / aspectRatio - PADDING,
    };
    if (result.height > size.height) {
      return {
        width: size.height * aspectRatio - PADDING,
        height: size.height - PADDING,
      };
    }
    return result;
  }, [size]);

  const isPreviewInitialized = useRef(false);
  const renderer = useRef<PreviewRenderer | null>(null);

  useEffect(() => {
    if (isPreviewInitialized.current || !canvasRef.current) {
      return;
    }

    isPreviewInitialized.current = true;
    renderer.current = new PreviewRenderer(canvasRef.current);
  }, []);

  return (
    <EditorPanel>
      <div
        ref={containerRef}
        className="flex items-center justify-center w-full h-full"
      >
        <canvas
          ref={canvasRef}
          className="aspect-video bg-black"
          style={{ width: canvasSize.width, height: canvasSize.height }}
        />
      </div>
    </EditorPanel>
  );
}
