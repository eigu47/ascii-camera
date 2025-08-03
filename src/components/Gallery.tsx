import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAutoAnimate } from "@/lib/hooks";
import { Photo, UseState } from "@/lib/types";
import { Download, Trash } from "lucide-preact";

export default function Gallery({
  photoState: [photos, setPhotos],
  openCamera,
}: {
  photoState: UseState<Photo[]>;
  openCamera: () => void;
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
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2"
          onClick={openCamera}
        >
          ← Back to Camera
        </Button>
      </div>
      {photos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="mb-2 text-xl font-semibold">No Photos Yet</h2>
          <p className="mb-4 text-gray-400">
            Take your first photo to get started
          </p>
          <Button onClick={openCamera}>Open Camera</Button>
        </div>
      ) : (
        <div
          ref={parent}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {photos.map((photo) => (
            <Card
              key={photo.timestamp}
              className="gap-0 overflow-hidden rounded border border-gray-700 bg-gray-900 p-0"
            >
              <CardContent className="group relative p-0">
                <img
                  src={photo.url}
                  alt={`Photo taken on ${new Date(Number(photo.timestamp)).toLocaleString()}`}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute top-1 right-1 flex flex-col items-center justify-center gap-2 transition-opacity group-hover:opacity-100 md:inset-0 md:flex-row md:gap-6 md:bg-black/50 md:opacity-0">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 text-2xl"
                    onClick={() => downloadPhoto(photo)}
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 text-2xl"
                    onClick={() => deletePhoto(photo)}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="p-2">
                <p className="text-xs text-gray-400">
                  {new Date(Number(photo.timestamp)).toLocaleString()}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
