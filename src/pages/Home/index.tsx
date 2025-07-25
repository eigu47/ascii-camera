import Camera from "@/components/Camera";
import Gallery from "@/components/Gallery";
import { DEFAULT_CAMERA_RESOLUTION } from "@/lib/constants";
import { useEffect, useRef, useState } from "preact/hooks";

export type Photo = {
  url: string;
  timestamp: string;
};

export default function Home() {
  const [isCamera, setIsCamera] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [photos, setPhotos] = useState<Photo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isCamera) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
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
    }

    if (canvasRef.current) {
      canvasRef.current.width = DEFAULT_CAMERA_RESOLUTION.width;
      canvasRef.current.height = DEFAULT_CAMERA_RESOLUTION.height;
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.setTransform(-1, 0, 0, 1, canvasRef.current.width, 0);
      }
    }
  }

  async function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
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
    const photo = canvasRef.current.toDataURL("image/jpeg", 0.8);
    setPhotos([{ url: photo, timestamp: Date.now().toString() }, ...photos]);
  }

  function downloadPhoto(photo: Photo) {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `photo-${new Date(Number(photo.timestamp)).toISOString().slice(0, 19)}.jpeg`;
    link.click();
  }

  function deletePhoto(photo: Photo) {
    setPhotos(photos.filter((p) => p.timestamp !== photo.timestamp));
  }

  function switchCamera() {
    setFacingMode(facingMode === "user" ? "environment" : "user");
  }

  return (
    <div className="h-screen bg-black text-white">
      {isCamera ? (
        <Camera
          videoRef={videoRef}
          canvasRef={canvasRef}
          photos={photos}
          setIsCamera={setIsCamera}
          takePhoto={takePhoto}
          switchCamera={switchCamera}
        />
      ) : (
        <Gallery
          photos={photos}
          setIsCamera={setIsCamera}
          downloadPhoto={downloadPhoto}
          deletePhoto={deletePhoto}
        />
      )}
    </div>
  );
}
