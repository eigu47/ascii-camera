import { RefObject } from "preact";
import { Photo } from "@/pages/Home";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="relative h-full">
      {/* Camera */}
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      {/* Camera Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          {/* Photos */}
          <Button
            variant="ghost"
            className="w-12 h-12 rounded-lg border-2 border-white/50 overflow-hidden cursor-pointer p-0"
            onClick={() => setIsCamera(false)}
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
            className="w-16 h-16 rounded-full border-white border-3 hover:bg-white/20 cursor-pointer transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-white mx-auto" />
          </Button>
          {/* Switch Camera */}
          <Button
            onClick={switchCamera}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full border-white border-2 hover:bg-white/20 hover:text-white text-white cursor-pointer transition-all duration-200"
          >
            <p className="text-2xl mx-auto">🗘</p>
          </Button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
