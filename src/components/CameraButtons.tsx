import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function CameraButtons({
  photoUrl,
  openGallery,
  takePhoto,
  switchCamera,
}: {
  photoUrl: string | undefined;
  openGallery: () => void;
  takePhoto: () => void;
  switchCamera: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 flex w-full items-center justify-around border-t border-white/10 bg-neutral-900 bg-gradient-to-t from-black/80 to-transparent p-4 md:justify-center md:gap-50 md:border-0 md:bg-transparent">
      {/* Gallery */}
      <Button
        onClick={openGallery}
        variant="ghost"
        size="icon"
        className="h-12 w-12 cursor-pointer overflow-hidden rounded-lg border-2 border-white/50 p-0"
        title="Open Gallery"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Latest photo"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-white/20" />
        )}
      </Button>
      {/* Take Photo */}
      <Button
        variant="ghost"
        size="icon"
        className="h-16 w-16 cursor-pointer rounded-full border-3 border-white bg-transparent transition-all duration-200 hover:bg-white/20"
        title="Take Photo"
        onClick={takePhoto}
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
  );
}
