import { UseState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RefObject } from "preact";
import { TargetedEvent } from "preact/compat";
import { useSwipeable } from "react-swipeable";

export default function CameraCanvas({
  videoRef,
  canvasRef,
  hiddenCanvasRef,
  sidebarState: [sidebarOpen, setSidebarOpen],
  asciiState: [asciiMode],
  onVideoLoadedData,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  hiddenCanvasRef: RefObject<HTMLCanvasElement>;
  sidebarState: UseState<boolean>;
  asciiState: UseState<boolean>;
  onVideoLoadedData: (e: TargetedEvent<HTMLVideoElement>) => void;
}) {
  const swipeHandler = useSwipeable({
    onSwipedUp: () => {
      setSidebarOpen(true);
    },
    onSwipedDown: () => {
      setSidebarOpen(false);
    },
    preventScrollOnSwipe: true,
  });

  return (
    <div
      className={cn(
        "flex h-full flex-1 items-center justify-center bg-black pb-24 transition-transform duration-300 md:pb-0",
        sidebarOpen
          ? "translate-y-[-15vh] md:translate-x-[-10vw] md:translate-y-0"
          : "translate-y-0 md:translate-x-0 md:translate-y-0",
      )}
      {...swipeHandler}
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
