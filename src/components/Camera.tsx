import CameraButtons from "@/components/CameraButtons";
import CameraCanvas from "@/components/CameraCanvas";
import Sidebar from "@/components/CameraSidebar";
import { CAMERA_RES, CHAR_MAP, CHAR_RES, INITIAL_STATE } from "@/lib/constants";
import { CameraSettings, Photo, SetState, UseState } from "@/lib/types";
import { useEffect, useRef, useState } from "preact/hooks";

export default function Camera({
  photoState: [photos, setPhotos],
  setIsCamera,
}: {
  photoState: UseState<Photo[]>;
  setIsCamera: SetState<boolean>;
}) {
  const sidebarState = useState(false);
  const asciiModeState = useState(INITIAL_STATE.asciiMode);
  const settingsRef = useRef<CameraSettings>(INITIAL_STATE);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D>(null);
  const hiddenCtxRef = useRef<CanvasRenderingContext2D>(null);
  const prevCharRef = useRef<string[][]>([]);
  const animationReqRef = useRef(0);

  // const renderAscii = useCallback(() => {
  function renderAscii() {
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

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = pixels[pixelIndex] ?? 0;
        const g = pixels[pixelIndex + 1] ?? 0;
        const b = pixels[pixelIndex + 2] ?? 0;

        const brightness = Math.floor((r + g + b) / 3);
        const char = CHAR_MAP[settingsRef.current.chars][brightness] ?? " ";

        if (char != prevCharRef.current[y]?.[x]) {
          canvasCtx.clearRect(
            x * CHAR_RES.width,
            y * CHAR_RES.height,
            CHAR_RES.width,
            CHAR_RES.height,
          );

          if (!settingsRef.current.colorMode) {
            canvasCtx.fillStyle = `rgb(${r.toString()}, ${g.toString()}, ${b.toString()})`;
          }

          canvasCtx.fillText(char, x * CHAR_RES.width, y * CHAR_RES.height);
          prevCharRef.current[y]![x] = char;
        }
      }
    }

    animationReqRef.current = requestAnimationFrame(renderAscii);
  } //, []);

  // const startCamera = useCallback(async () => {
  async function startCamera() {
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
  } //, []);

  useEffect(() => {
    void startCamera();

    return stopCamera;
  }, []);

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

    const filterStr = `contrast(${settingsRef.current.contrast.toString()}%) brightness(${settingsRef.current.brightness.toString()}%)`;

    const { videoWidth: width, videoHeight: height } = video;
    if (!settingsRef.current.asciiMode) {
      canvas.width = width;
      canvas.height = height;
      canvasCtx.setTransform(-1, 0, 0, 1, width, 0);
      video.style.filter = filterStr;
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
    if (settingsRef.current.colorMode) {
      canvasCtx.fillStyle = settingsRef.current.color;
    }
    hiddenCtx.setTransform(-1, 0, 0, 1, asciiWidth, 0);
    hiddenCtx.filter = filterStr;

    prevCharRef.current = Array.from({ length: asciiHeight }, () =>
      Array.from({ length: asciiWidth }, () => ""),
    );
  }

  return (
    <div className="relative flex h-full w-full flex-row">
      <CameraCanvas
        videoRef={videoRef}
        canvasRef={canvasRef}
        hiddenCanvasRef={hiddenCanvasRef}
        sidebarState={sidebarState}
        asciiState={asciiModeState}
        onVideoLoadedData={(e) => {
          void (e.target as HTMLVideoElement | null)?.play();
          resizeCanvas();
          renderAscii();
        }}
      />

      <Sidebar
        sidebarState={sidebarState}
        settingsRef={settingsRef}
        resizeCanvas={resizeCanvas}
        asciiModeState={asciiModeState}
        renderAscii={renderAscii}
      />

      <CameraButtons
        photoUrl={photos[0]?.url}
        openGallery={() => setIsCamera(false)}
        takePhoto={() => {
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
        switchCamera={() => {
          settingsRef.current.facingMode =
            settingsRef.current.facingMode == "user" ? "environment" : "user";

          void startCamera();
        }}
      />
    </div>
  );
}
