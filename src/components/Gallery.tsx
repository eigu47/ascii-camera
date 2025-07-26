import { Button } from "@/components/ui/button";
import { useAutoAnimate } from "@/lib/hooks";
import { Photo, UseState } from "@/lib/types";
import { Download, Trash } from "lucide-preact";

export default function Gallery({
  photoState: [photos, setPhotos],
  setIsCamera,
}: {
  photoState: UseState<Photo[]>;
  setIsCamera: (isCamera: boolean) => void;
}) {
  const [parent] = useAutoAnimate<HTMLDivElement>();

  function downloadPhoto(photo: Photo) {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `photo-${new Date(Number(photo.timestamp)).toISOString().slice(0, 19)}.jpeg`;
    link.click();
  }

  function deletePhoto(photo: Photo) {
    setPhotos(photos.filter((p) => p.timestamp !== photo.timestamp));
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-black p-4 text-white">
      <div className="mb-4 flex items-center">
        <Button
          onClick={() => setIsCamera(true)}
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2"
        >
          <span className="text-xl">←</span>
          <span>Back to Camera</span>
        </Button>
      </div>
      {photos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-xl font-semibold">No Photos Yet</h2>
          <p className="mb-4 text-gray-400">
            Take your first photo to get started
          </p>
          <Button onClick={() => setIsCamera(true)}>Open Camera</Button>
        </div>
      ) : (
        <div
          ref={parent}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {photos.map((photo) => (
            <div
              key={photo.timestamp}
              className="overflow-hidden rounded border border-gray-700 bg-gray-900"
            >
              <div className="group relative">
                <img
                  src={photo.url}
                  alt={`Photo taken on ${new Date(Number(photo.timestamp)).toLocaleString()}`}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    onClick={() => downloadPhoto(photo)}
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 text-2xl"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => deletePhoto(photo)}
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 text-2xl"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-400">
                  {new Date(Number(photo.timestamp)).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
