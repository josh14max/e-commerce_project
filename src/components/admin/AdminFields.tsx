import { useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadSiteImage } from '@/lib/siteSettings';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  help?: string;
}

export function AdminField({ label, value, onChange, multiline = false, help }: FieldProps) {
  const className = 'w-full rounded-sm border border-nge-line px-3 py-3 text-base focus:border-nge-black focus:outline-none';
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-nge-muted">{label}</span>
      {multiline ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className={`${className} resize-y`} />
      ) : (
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
      {help && <span className="mt-1 block text-xs text-nge-muted">{help}</span>}
    </label>
  );
}

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function AdminImageField({ label, value, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const result = await uploadSiteImage(file);
    setUploading(false);
    if (result.error || !result.url) {
      setError(result.error ?? "Impossible d'envoyer l'image.");
      return;
    }
    onChange(result.url);
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-nge-muted">{label}</span>
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <button type="button" onClick={() => inputRef.current?.click()} className="relative aspect-[4/3] overflow-hidden rounded-sm border border-nge-line bg-nge-bg-alt">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="absolute inset-0 m-auto h-6 w-6 text-nge-muted" />}
          {uploading && <span className="absolute inset-0 grid place-items-center bg-white/80"><Loader2 className="h-5 w-5 animate-spin" /></span>}
        </button>
        <div className="flex flex-col justify-center gap-2">
          <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Adresse de l'image" className="w-full rounded-sm border border-nge-line px-3 py-3 text-sm focus:border-nge-black focus:outline-none" />
          <button type="button" onClick={() => inputRef.current?.click()} className="h-10 rounded-full border border-nge-line px-4 text-xs font-medium uppercase tracking-wide hover:border-nge-black">Choisir une image</button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function AdminSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-sm border border-nge-line bg-white p-4 sm:p-6">
      <h3 className="mb-5 font-display text-xl text-nge-black">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
