import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Photo } from "@/pages/Home";
import { ChevronRight, RefreshCw } from "lucide-preact";
import { RefObject } from "preact";
import { useState } from "preact/hooks";

export default function Camera({
  videoRef,
  canvasRef,
  photos,
  setIsCamera,
  takePhoto,
  switchCamera,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  photos: Photo[];
  setIsCamera: (isCamera: boolean) => void;
  takePhoto: () => void;
  switchCamera: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarBtnRotation, setSidebarBtnRotation] = useState(0);
  const [selectedRadio, setSelectedRadio] = useState("option1");

  return (
    <div className="relative h-full flex flex-row w-full">
      {/* Camera */}
      <div
        className={cn(
          "flex-1 h-full bg-black flex items-center justify-center transition-transform duration-300",
          sidebarOpen ? "md:translate-x-[-10vw]" : "md:translate-x-0"
        )}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      {/* Open/Close Sidebar Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          setSidebarOpen((prev) => !prev);
          setSidebarBtnRotation((r) => r - 180);
        }}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="absolute right-2 top-2 z-30 flex items-center justify-center"
      >
        <ChevronRight
          className="w-6 h-6 transition-transform duration-200"
          style={{ transform: `rotate(${sidebarBtnRotation}deg)` }}
        />
      </Button>
      {/* Sidebar */}
      <div className="relative h-full">
        <aside
          className={cn(
            "fixed right-0 top-0 h-full w-80 max-w-full bg-black border-l border-white/10 flex flex-col transition-transform duration-300 z-20",
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
          style={{ willChange: "transform" }}
        >
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 pt-12 flex flex-col gap-4">
            {/* Radio Controls */}
            <div>
              <div className="mb-2 font-medium">Options</div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
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
                <label className="flex items-center gap-2 cursor-pointer">
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
          </div>
          {/* Bottom Controls */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between gap-2 bg-neutral-900">
            {/* Gallery */}
            <Button
              onClick={() => setIsCamera(false)}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-lg border-2 border-white/50 overflow-hidden cursor-pointer p-0"
              title="Open Gallery"
            >
              {photos.length > 0 ? (
                <img src={photos[0].url} alt="Latest photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20" />
              )}
            </Button>
            {/* Take Photo */}
            <Button
              onClick={takePhoto}
              size="icon"
              className="w-16 h-16 rounded-full border-white border-3 bg-transparent hover:bg-white/20 cursor-pointer transition-all duration-200"
              title="Take Photo"
            >
              <div className="w-12 h-12 rounded-full bg-white mx-auto" />
            </Button>
            {/* Switch Camera */}
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full border-white border-2 hover:bg-white/20 hover:text-white text-white cursor-pointer transition-all duration-200"
              title="Switch Camera"
            >
              <RefreshCw className="w-8 h-8 mx-auto" />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
