import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ConfirmModal — a centred overlay modal for confirmations.
 *
 * Props:
 *  isOpen          (bool)   — controls visibility
 *  title           (string) — modal heading
 *  message         (string) — body copy
 *  onConfirm       (fn)     — called with (inputValue?) when "Confirm" is clicked
 *  onCancel        (fn)     — called when "Cancel" or backdrop is clicked
 *  showInput       (bool)   — renders a textarea when true
 *  inputLabel      (string) — label above the textarea
 *  inputPlaceholder(string) — placeholder text for textarea
 */
export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  onConfirm,
  onCancel,
  showInput = false,
  inputLabel = '',
  inputPlaceholder = '',
}) {
  const [inputValue, setInputValue] = useState('');

  // Reset input every time modal opens
  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(showInput ? inputValue : undefined);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Card — stop propagation so clicks inside don't close */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close × */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Heading */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>

        {/* Body */}
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
        )}

        {/* Optional textarea */}
        {showInput && (
          <div className="mb-4">
            {inputLabel && (
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {inputLabel}
              </label>
            )}
            <textarea
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
