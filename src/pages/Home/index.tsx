import Camera from "@/components/Camera";
import Gallery from "@/components/Gallery";
import { Photo } from "@/lib/types";
import { useState } from "preact/hooks";

export default function Home() {
  const [isCamera, setIsCamera] = useState(true);
  const photoState = useState<Photo[]>([]);

  return (
    <div className="h-screen bg-black text-white">
      {isCamera ? (
        <Camera photoState={photoState} setIsCamera={setIsCamera} />
      ) : (
        <Gallery photoState={photoState} openCamera={() => setIsCamera(true)} />
      )}
    </div>
  );
}
