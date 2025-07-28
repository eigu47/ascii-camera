import Sidebar from "@/components/CameraSidebar";
import { Button } from "@/components/ui/button";
import { ASCII_CHARS, CAMERA_RES, CHAR_RES } from "@/lib/constants";
import { Photo, AnimationSetting, UseState, CameraSetting } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";

export default function Camera({
  cameraState: [isCamera, setIsCamera],
  photoState: [photos, setPhotos],
}: {
  cameraState: UseState<boolean>;
  photoState: UseState<Photo[]>;
}) {
  const animationSettingRef = useRef<AnimationSetting>({
    chars: "detailed",
    res: 1,
  });
  const [cameraSetting, setCameraSetting] = useState<CameraSetting>({
    facingMode: "environment",
  });
  const sidebarState = useState(false);
  const [sidebarOpen, setSidebarOpen] = sidebarState;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    void startCamera(cameraSetting);

    return () => {
      stopCamera();
    };
  }, [cameraSetting]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationReq = 0;
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

      const { width, height } = hiddenCanvas;
      hiddenCtx.drawImage(video, 0, 0, width, height);
      const imageData = hiddenCtx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff00";
      ctx.font = "10px monospace";
      ctx.textBaseline = "top";

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * 4;
          const r = pixels[pixelIndex] ?? 0;
          const g = pixels[pixelIndex + 1] ?? 0;
          const b = pixels[pixelIndex + 2] ?? 0;

          const chars = ASCII_CHARS[animationSettingRef.current.chars];
          const brightness = (r + g + b) / 3;
          const charIndex = Math.floor((brightness / 255) * (chars.length - 1));

          const char = chars[charIndex] ?? " ";
          ctx.fillText(char, x * 8, y * 12);
        }
      }

      animationReq = requestAnimationFrame(renderAscii);
    }

    video.addEventListener("play", renderAscii, { once: true });

    return () => {
      cancelAnimationFrame(animationReq);
      video.removeEventListener("play", renderAscii);
    };
  }, []);

  async function startCamera({ facingMode }: CameraSetting) {
    if (!videoRef.current) return;
    stopCamera();

    const { width, height } = CAMERA_RES;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = resizeCanvas;
      await videoRef.current.play();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  function stopCamera() {
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

    const { videoWidth: width, videoHeight: height } = video;
    const asciiWidth = Math.floor(width / 10);
    const asciiHeight = Math.floor(height / 10);

    hiddenCanvas.width = asciiWidth;
    hiddenCanvas.height = asciiHeight;
    canvas.width = asciiWidth * CHAR_RES.width;
    canvas.height = asciiHeight * CHAR_RES.height;

    hiddenCanvas.getContext("2d")?.setTransform(-1, 0, 0, 1, asciiWidth, 0);
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
    setCameraSetting((prev) => ({
      ...prev,
      facingMode: prev.facingMode == "user" ? "environment" : "user",
    }));
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

      <Sidebar
        sidebarState={sidebarState}
        animationSettingRef={animationSettingRef}
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
