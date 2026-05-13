'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Camera, FileText, Trash2, Download, Loader2 } from 'lucide-react';
import { formatBytes, cn } from '@/lib/utils';
import type { Document, DocumentCategory } from '@/lib/db/schema';

interface Props {
  monthId: string;
  category: DocumentCategory;
  label: string;
  documents: Document[];
}

export function CategorySection({ monthId, category, label, documents }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    setUploading(true);
    setError(null);
    setProgress({ done: 0, total: fileArr.length });

    try {
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        const fd = new FormData();
        fd.append('file', file);
        fd.append('monthId', monthId);
        fd.append('category', category);

        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Eroare la ${file.name}`);
        }
        setProgress({ done: i + 1, total: fileArr.length });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încarcare');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  async function handleDelete(id: string) {
    if (!confirm('Sigur ștergi acest document?')) return;
    startTransition(async () => {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    });
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div className="flex items-baseline gap-4">
          <h2 className="font-display text-3xl">{label}</h2>
          <span className="text-xs tracking-wider uppercase text-ink-400 tabular-nums">
            {documents.length}
          </span>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border border-dashed border-ink-100 bg-cream-100/50 transition-all',
          isDragging && 'drag-active',
          'p-5 sm:p-6 mb-3',
        )}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 text-sm text-ink-400">
            {uploading && progress ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Se încarcă {progress.done} / {progress.total}…
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">Trage fișiere aici sau </span>
                <span className="sm:hidden">Adaugă: </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-ink-700 text-cream-50 px-4 py-2.5 text-sm hover:bg-ink-900 disabled:opacity-50 transition-colors"
            >
              <Camera size={16} />
              <span className="sm:inline">Fă poză</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-cream-50 border border-ink-100 text-ink-700 px-4 py-2.5 text-sm hover:bg-cream-200 disabled:opacity-50 transition-colors"
            >
              <Upload size={16} />
              <span>Încarcă</span>
            </button>
          </div>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.heic,.heif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />

        {error && (
          <div className="mt-3 text-sm text-accent-dark border-l-2 border-accent pl-3">
            {error}
          </div>
        )}
      </div>

      {documents.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cream-200">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={() => handleDelete(doc.id)}
              disabled={pending}
            />
          ))}
        </ul>
      ) : (
        <div className="text-sm text-ink-400 py-4 italic">
          Niciun document în această categorie încă.
        </div>
      )}
    </section>
  );
}

function DocumentCard({
  doc,
  onDelete,
  disabled,
}: {
  doc: Document;
  onDelete: () => void;
  disabled: boolean;
}) {
  const isImage = doc.mimeType.startsWith('image/');
  return (
    <li className="bg-cream-50 p-4 flex gap-3 group lift">
      <div className="flex-shrink-0 w-12 h-12 bg-cream-100 flex items-center justify-center border border-cream-200">
        {isImage ? (
          <a href={doc.blobUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doc.blobUrl}
              alt={doc.filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </a>
        ) : (
          <FileText size={18} className="text-ink-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={doc.blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium truncate hover:text-accent transition-colors"
          title={doc.filename}
        >
          {doc.filename}
        </a>
        <div className="flex items-center gap-2 text-xs text-ink-400 mt-1 tabular-nums">
          <span>{formatBytes(doc.sizeBytes)}</span>
          <span>·</span>
          <span>
            {new Date(doc.createdAt).toLocaleDateString('ro-RO', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={doc.blobUrl}
          download={doc.filename}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-ink-400 hover:text-accent transition-colors"
          title="Descarcă"
        >
          <Download size={14} />
        </a>
        <button
          onClick={onDelete}
          disabled={disabled}
          className="p-1 text-ink-400 hover:text-accent-dark transition-colors disabled:opacity-50"
          title="Şterge"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
