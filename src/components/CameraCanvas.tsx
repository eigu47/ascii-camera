import { cn } from "@/lib/utils";
import { RefObject } from "preact";
import { TargetedEvent } from "preact/compat";

export default function CameraCanvas({
  videoRef,
  canvasRef,
  hiddenCanvasRef,
  sidebarOpen,
  asciiMode,
  onVideoLoadedData,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  hiddenCanvasRef: RefObject<HTMLCanvasElement>;
  sidebarOpen: boolean;
  asciiMode: boolean;
  onVideoLoadedData: (e: TargetedEvent<HTMLVideoElement>) => void;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-1 items-center justify-center bg-black transition-transform duration-300",
        sidebarOpen
          ? "translate-y-[-15vh] md:translate-x-[-10vw] md:translate-y-0"
          : "translate-y-0 md:translate-x-0 md:translate-y-0",
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={
          asciiMode ? "hidden" : "h-full w-full scale-x-[-1] object-contain"
        }
        onLoadedData={onVideoLoadedData}
      />
      <canvas
        ref={canvasRef}
        className={asciiMode ? "h-full w-full object-contain" : "hidden"}
        style={{ imageRendering: "pixelated" }}
      />
      <canvas ref={hiddenCanvasRef} className="hidden" />
    </div>
  );
}
