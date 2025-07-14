import { Photo } from "@/pages/Home";

interface GalleryProps {
  photos: Photo[];
  setIsCamera: (isCamera: boolean) => void;
  downloadPhoto: (photo: Photo) => void;
  deletePhoto: (photo: Photo) => void;
}

export default function Gallery({ photos, setIsCamera, downloadPhoto, deletePhoto }: GalleryProps) {
  return (
    <div className="p-4 h-screen overflow-y-auto bg-black text-white">
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-xl font-semibold mb-2">No Photos Yet</h2>
          <p className="text-gray-400 mb-4">Take your first photo to get started</p>
          <button onClick={() => setIsCamera(true)} className="main-btn">
            Open Camera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.timestamp} className="bg-gray-900 border border-gray-700 rounded overflow-hidden">
              <div className="relative group">
                <img
                  src={photo.url}
                  alt={`Photo taken on ${new Date(Number(photo.timestamp)).toLocaleString()}`}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => downloadPhoto(photo)} title="Download" className="icon-btn">
                    ⤓
                  </button>
                  <button onClick={() => deletePhoto(photo)} title="Delete" className="icon-btn">
                    🗑
                  </button>
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
