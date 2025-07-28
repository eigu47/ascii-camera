import Sidebar from "@/components/CameraSidebar";
import { Button } from "@/components/ui/button";
import {
  ASCII_CHARS,
  CAMERA_RES,
  CHAR_RES,
  INITIAL_STATE,
} from "@/lib/constants";
import { CameraSettings, Photo, UseState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export default function Camera({
  cameraState: [, setIsCamera],
  photoState: [photos, setPhotos],
}: {
  cameraState: UseState<boolean>;
  photoState: UseState<Photo[]>;
}) {
  const settingsRef = useRef<CameraSettings>(INITIAL_STATE);
  const sidebarState = useState(false);
  const [sidebarOpen] = sidebarState;
  const asciiModeState = useState(INITIAL_STATE.asciiMode);
  const [asciiMode] = asciiModeState;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D>(null);
  const hiddenCtxRef = useRef<CanvasRenderingContext2D>(null);
  const prevCharRef = useRef<string[][]>([]);
  const animationReqRef = useRef(0);

  const renderAscii = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const canvasCtx = canvas?.getContext("2d");
    const hiddenCtx = hiddenCanvas?.getContext("2d");
    if (
      !video ||
      !canvas ||
      !hiddenCanvas ||
      !canvasCtx ||
      !hiddenCtx ||
      !settingsRef.current.asciiMode
    ) {
      cancelAnimationFrame(animationReqRef.current);
      return;
    }

    const { width, height } = hiddenCanvas;
    hiddenCtx.drawImage(video, 0, 0, width, height);
    const imageData = hiddenCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    canvasCtx.fillStyle = "#0f0";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = pixels[pixelIndex] ?? 0;
        const g = pixels[pixelIndex + 1] ?? 0;
        const b = pixels[pixelIndex + 2] ?? 0;

        const chars = ASCII_CHARS[settingsRef.current.chars];
        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor((brightness / 255) * (chars.length - 1));

        const char = chars[charIndex] ?? " ";

        if (char != prevCharRef.current[y]?.[x]) {
          canvasCtx.clearRect(
            x * CHAR_RES.width,
            y * CHAR_RES.height,
            CHAR_RES.width,
            CHAR_RES.height,
          );
          canvasCtx.fillText(char, x * CHAR_RES.width, y * CHAR_RES.height);
          prevCharRef.current[y]![x] = char;
        }
      }
    }

    animationReqRef.current = requestAnimationFrame(renderAscii);
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    stopCamera();

    const { width, height } = CAMERA_RES;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: settingsRef.current.facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
      });

      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }, []);

  useEffect(() => {
    void startCamera();

    return stopCamera;
  }, [startCamera]);

  function stopCamera() {
    cancelAnimationFrame(animationReqRef.current);

    const video = videoRef.current;
    if (!video) return;
    (video.srcObject as MediaStream | null)
      ?.getTracks()
      .forEach((track) => track.stop());
    video.srcObject = null;
  }

  function resizeCanvas() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!video || !canvas || !hiddenCanvas) return;

    const canvasCtx = canvas.getContext("2d", { willReadFrequently: true });
    const hiddenCtx = hiddenCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    canvasCtxRef.current = canvasCtx;
    hiddenCtxRef.current = hiddenCtx;
    if (!canvasCtx || !hiddenCtx) return;

    const { videoWidth: width, videoHeight: height } = video;
    if (!settingsRef.current.asciiMode) {
      canvas.width = width;
      canvas.height = height;
      canvasCtx.setTransform(-1, 0, 0, 1, width, 0);
      return;
    }

    const asciiWidth = Math.floor(width / (10 * settingsRef.current.res));
    const asciiHeight = Math.floor(height / (10 * settingsRef.current.res));

    canvas.width = asciiWidth * CHAR_RES.width;
    canvas.height = asciiHeight * CHAR_RES.height;
    hiddenCanvas.width = asciiWidth;
    hiddenCanvas.height = asciiHeight;

    canvasCtx.font = "10px Consolas, monospace";
    canvasCtx.textBaseline = "top";
    canvasCtx.fillStyle = "#0f0";
    hiddenCtx.setTransform(-1, 0, 0, 1, asciiWidth, 0);

    prevCharRef.current = Array.from({ length: asciiHeight }, () =>
      Array.from({ length: asciiWidth }, () => ""),
    );
  }

  return (
    <div className="relative flex h-full w-full flex-row overflow-hidden">
      {/* Camera */}
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
          className={asciiMode ? "hidden" : "h-full w-full scale-x-[-1]"}
          onLoadedData={(e) => {
            void (e.target as HTMLVideoElement | null)?.play();
            resizeCanvas();
            renderAscii();
          }}
        />
        <canvas
          ref={canvasRef}
          className={asciiMode ? "h-full w-full" : "hidden"}
          style={{ imageRendering: "pixelated" }}
        />
        <canvas ref={hiddenCanvasRef} className="hidden" />
      </div>

      <Sidebar
        sidebarState={sidebarState}
        settingsRef={settingsRef}
        resizeCanvas={resizeCanvas}
        asciiModeState={asciiModeState}
        renderAscii={renderAscii}
      />

      {/* Button Controls */}
      <div className="absolute bottom-0 left-0 flex w-full items-center justify-around border-t border-white/10 bg-neutral-900 bg-gradient-to-t from-black/80 to-transparent p-4 md:justify-center md:gap-50 md:border-0 md:bg-transparent">
        {/* Gallery */}
        <Button
          onClick={() => setIsCamera(false)}
          variant="ghost"
          size="icon"
          className="h-12 w-12 cursor-pointer overflow-hidden rounded-lg border-2 border-white/50 p-0"
          title="Open Gallery"
        >
          {photos.length > 0 ? (
            <img
              src={photos[0]?.url}
              alt="Latest photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-white/20" />
          )}
        </Button>
        {/* Take Photo */}
        <Button
          onClick={() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const canvasCtx = canvasCtxRef.current;
            if (!video || !canvas || !canvasCtx) return;

            if (!settingsRef.current.asciiMode) {
              canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }

            setPhotos([
              {
                url: canvas.toDataURL("image/jpeg", 0.8),
                timestamp: Date.now().toString(),
              },
              ...photos,
            ]);
          }}
          size="icon"
          className="h-16 w-16 cursor-pointer rounded-full border-3 border-white bg-transparent transition-all duration-200 hover:bg-white/20"
          title="Take Photo"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-white" />
        </Button>
        {/* Switch Camera */}
        <Button
          onClick={() => {
            settingsRef.current.facingMode =
              settingsRef.current.facingMode == "user" ? "environment" : "user";

            void startCamera();
          }}
          variant="ghost"
          size="icon"
          className="h-12 w-12 cursor-pointer rounded-full border-2 border-white text-white transition-all duration-200 hover:bg-white/20 hover:text-white"
          title="Switch Camera"
        >
          <RefreshCw className="mx-auto h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
