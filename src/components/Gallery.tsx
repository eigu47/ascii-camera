import { Button } from "@/components/ui/button";
import { Photo } from "@/pages/Home";
import { useAutoAnimate } from "@formkit/auto-animate/preact";
import { Download, Trash } from "lucide-preact";

export default function Gallery({
  photos,
  setIsCamera,
  downloadPhoto,
  deletePhoto,
}: {
  photos: Photo[];
  setIsCamera: (isCamera: boolean) => void;
  downloadPhoto: (photo: Photo) => void;
  deletePhoto: (photo: Photo) => void;
}) {
  const [parent] = useAutoAnimate();

  return (
    <div className="p-4 flex flex-col h-screen overflow-y-auto bg-black text-white">
      <div className="mb-4 flex items-center">
        <Button onClick={() => setIsCamera(true)} variant="secondary" className="flex items-center gap-2 px-4 py-2">
          <span className="text-xl">←</span>
          <span>Back to Camera</span>
        </Button>
      </div>
      {photos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold mb-2">No Photos Yet</h2>
          <p className="text-gray-400 mb-4">Take your first photo to get started</p>
          <Button onClick={() => setIsCamera(true)}>Open Camera</Button>
        </div>
      ) : (
        <div ref={parent} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.timestamp} className="bg-gray-900 border border-gray-700 rounded overflow-hidden">
              <div className="relative group">
                <img
                  src={photo.url}
                  alt={`Photo taken on ${new Date(Number(photo.timestamp)).toLocaleString()}`}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button
                    onClick={() => downloadPhoto(photo)}
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 text-2xl"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => deletePhoto(photo)}
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8 text-2xl"
                  >
                    <Trash className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-400">{new Date(Number(photo.timestamp)).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
