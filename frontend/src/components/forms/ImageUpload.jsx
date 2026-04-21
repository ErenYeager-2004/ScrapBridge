import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILES = 5;

/**
 * ImageUpload — drag-and-drop / click-to-upload image picker.
 *
 * Props:
 *  onChange(files) — called with the current File array whenever selection changes
 */
export default function ImageUpload({ onChange }) {
  const [previews, setPreviews] = useState([]); // [{ file, url }]
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback(
    (newFiles) => {
      const validFiles = Array.from(newFiles).filter((f) =>
        ACCEPTED_TYPES.includes(f.type)
      );
      setPreviews((prev) => {
        const combined = [...prev];
        for (const file of validFiles) {
          if (combined.length >= MAX_FILES) break;
          combined.push({ file, url: URL.createObjectURL(file) });
        }
        onChange && onChange(combined.map((p) => p.file));
        return combined;
      });
    },
    [onChange]
  );

  const removeFile = (idx) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      const updated = prev.filter((_, i) => i !== idx);
      onChange && onChange(updated.map((p) => p.file));
      return updated;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-8 cursor-pointer transition-colors ${
          dragOver
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <UploadCloud
          size={32}
          className={`transition-colors ${
            dragOver ? 'text-green-500' : 'text-gray-400'
          }`}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          <span className="font-semibold text-green-600 dark:text-green-400">
            Click to upload
          </span>{' '}
          or drag &amp; drop
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          JPEG, PNG, WEBP — max {MAX_FILES} files
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Thumbnails */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map(({ url }, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`preview-${idx}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                aria-label="Remove image"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
