import { Button } from "@/components/ui/button";
import { CAMERA_RES } from "@/lib/constants";
import { Photo, UseState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronsUp, RefreshCw } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";

interface Settings {
  facingMode: "user" | "environment";
}

export default function Camera({
  cameraState: [isCamera, setIsCamera],
  photoState: [photos, setPhotos],
}: {
  cameraState: UseState<boolean>;
  photoState: UseState<Photo[]>;
}) {
  const [settings, setSettings] = useState<Settings>({
    facingMode: "environment",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarBtnRotation, setSidebarBtnRotation] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    void startCamera(settings);

    function renderAscii() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      const ctx = canvas?.getContext("2d", {
        willReadFrequently: true,
      });
      const hiddenCtx = hiddenCanvas?.getContext("2d", {
        willReadFrequently: true,
      });
      if (!video || !canvas || !hiddenCanvas || !ctx || !hiddenCtx) return;

      const { videoWidth: width, videoHeight: height } = video;

      // Draw video frame to hidden canvas (scaled down)
      hiddenCtx.drawImage(video, 0, 0, width, height);

      // Get pixel data
      const imageData = hiddenCtx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Clear main canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = "#00ff00";
      ctx.font = "10px monospace";
      ctx.textBaseline = "top";

      // Convert pixels to ASCII
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * 4;
          const r = pixels[pixelIndex] ?? 0;
          const g = pixels[pixelIndex + 1] ?? 0;
          const b = pixels[pixelIndex + 2] ?? 0;

          // Calculate brightness (0-255)
          const brightness = (r + g + b) / 3;

          // Map brightness to ASCII character (inverted)
          const charIndex = Math.floor(
            ((255 - brightness) / 255) * (ASCII_CHARS.length - 1),
          );

          const char = ASCII_CHARS[charIndex] ?? " ";

          // Draw character
          ctx.fillText(char, x * 8, y * 12);
        }
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(renderAscii);
    }

    video.addEventListener("loadeddata", renderAscii);
    return () => {
      stopCamera();
      video.removeEventListener("loadeddata", renderAscii);
    };
  }, [settings]);

  async function startCamera(settings: Settings) {
    if (!videoRef.current) return;

    const { width, height } = CAMERA_RES;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: settings.facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const hiddenCanvas = hiddenCanvasRef.current;
        if (!video || !canvas || !hiddenCanvas) return;

        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width * 8;
        canvas.height = height * 12;
        hiddenCanvas.width = width;
        hiddenCanvas.height = height;

        // Set transform for mirroring
        hiddenCanvas.getContext("2d")?.setTransform(-1, 0, 0, 1, width, 0);
      };
      await videoRef.current.play();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());

    // Cancel animation frame to stop rendering
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }

  function takePhoto() {
    const context = canvasRef.current?.getContext("2d");
    if (!videoRef.current || !canvasRef.current || !context) return;

    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    setPhotos([
      {
        url: canvasRef.current.toDataURL("image/jpeg", 0.8),
        timestamp: Date.now().toString(),
      },
      ...photos,
    ]);
  }

  function switchCamera() {
    setSettings((prev) => {
      const settings: Settings = {
        ...prev,
        facingMode: prev.facingMode == "user" ? "environment" : "user",
      };
      void startCamera(settings);
      return settings;
    });
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
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
        <canvas ref={hiddenCanvasRef} className="hidden" />
      </div>
      {/* Open/Close Sidebar Button */}
      <Button
        size="icon"
        variant="outline"
        onClick={() => {
          setSidebarOpen((prev) => !prev);
          setSidebarBtnRotation((r) => r - 180);
        }}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="absolute right-3 bottom-20 z-30 cursor-pointer md:top-3 md:-rotate-90"
      >
        <ChevronsUp
          className="h-6 w-6 text-black transition-transform duration-200"
          style={{ transform: `rotate(${sidebarBtnRotation.toString()}deg)` }}
        />
      </Button>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed bottom-0 mb-24 flex h-1/2 w-full max-w-full flex-col border-l border-white/10 bg-black transition-transform duration-300 md:top-0 md:right-0 md:h-full md:w-80",
          sidebarOpen
            ? "translate-y-0 md:translate-x-0 md:translate-y-0"
            : "translate-y-full md:translate-x-full md:translate-y-0",
        )}
        style={{ willChange: "transform" }}
      >
        {/* Sidebar Content */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="mb-2 font-medium">ASCII Camera</div>
          <div className="text-sm text-gray-400">
            Real-time ASCII art from your camera feed.
          </div>
        </div>
      </aside>
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
          onClick={takePhoto}
          size="icon"
          className="h-16 w-16 cursor-pointer rounded-full border-3 border-white bg-transparent transition-all duration-200 hover:bg-white/20"
          title="Take Photo"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-white" />
        </Button>
        {/* Switch Camera */}
        <Button
          onClick={switchCamera}
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

const ASCII_CHARS =
  "                  .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
