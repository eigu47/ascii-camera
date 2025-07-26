import { Button } from "@/components/ui/button";
import { DEFAULT_CAMERA_RESOLUTION } from "@/lib/constants";
import { Photo, UseState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronsUp, RefreshCw } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";

export default function Camera({
  cameraState: [isCamera, setIsCamera],
  photoState: [photos, setPhotos],
}: {
  cameraState: UseState<boolean>;
  photoState: UseState<Photo[]>;
}) {
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarBtnRotation, setSidebarBtnRotation] = useState(0);
  const [selectedRadio, setSelectedRadio] = useState("option1");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isCamera) {
      void startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCamera, facingMode]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: DEFAULT_CAMERA_RESOLUTION.width },
          height: { ideal: DEFAULT_CAMERA_RESOLUTION.height },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unknown error");
    }

    if (canvasRef.current) {
      canvasRef.current.width = DEFAULT_CAMERA_RESOLUTION.width;
      canvasRef.current.height = DEFAULT_CAMERA_RESOLUTION.height;
      const context = canvasRef.current.getContext("2d");
      context?.setTransform(-1, 0, 0, 1, canvasRef.current.width, 0);
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
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
    const photo = canvasRef.current.toDataURL("image/jpeg", 0.8);
    setPhotos([{ url: photo, timestamp: Date.now().toString() }, ...photos]);
  }

  function switchCamera() {
    setFacingMode(facingMode === "user" ? "environment" : "user");
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
          className="h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas ref={canvasRef} className="hidden" />
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
          {/* Radio Controls */}
          <div className="mb-2 font-medium">Options</div>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="camera-option"
                value="option1"
                checked={selectedRadio === "option1"}
                onChange={() => setSelectedRadio("option1")}
                className="accent-white"
              />
              <span>Option 1</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="camera-option"
                value="option2"
                checked={selectedRadio === "option2"}
                onChange={() => setSelectedRadio("option2")}
                className="accent-white"
              />
              <span>Option 2</span>
            </label>
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
