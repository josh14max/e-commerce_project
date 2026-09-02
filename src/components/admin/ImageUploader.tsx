import { useRef, useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadProductImage } from '@/lib/adminProducts';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const { url, error } = await uploadProductImage(file);
      if (error) {
        setError(`Échec de l'upload de ${file.name} : ${error}`);
      } else if (url) {
        newUrls.push(url);
      }
    }

    setUploading(false);
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-nge-black bg-nge-bg' : 'border-nge-line hover:border-nge-muted'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-nge-muted" />
            <p className="text-sm text-nge-muted">Envoi en cours…</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-nge-muted" />
            <p className="text-sm text-nge-muted">
              Glisse une ou plusieurs photos ici, ou clique pour choisir un fichier
            </p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-sm overflow-hidden bg-nge-bg-alt group">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Retirer cette photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-medium uppercase tracking-wide bg-white/90 px-1.5 py-0.5 rounded-sm">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
