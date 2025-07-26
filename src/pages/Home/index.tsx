import Camera from "@/components/Camera";
import Gallery from "@/components/Gallery";
import { Photo } from "@/lib/types";
import { useState } from "preact/hooks";

export default function Home() {
  const cameraState = useState(true);
  const [isCamera, setIsCamera] = cameraState;
  const photoState = useState<Photo[]>([]);

  return (
    <div className="h-screen bg-black text-white">
      {isCamera ? (
        <Camera cameraState={cameraState} photoState={photoState} />
      ) : (
        <Gallery photoState={photoState} setIsCamera={setIsCamera} />
      )}
    </div>
  );
}
