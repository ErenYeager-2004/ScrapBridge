import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating — 5-star rating widget.
 *
 * Props:
 *  value    (1-5)     — current/default rating
 *  onChange (fn)      — called with the new rating; ignored in readOnly mode
 *  readOnly (bool)    — disables interaction when true
 */
export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(null);

  const displayRating = hovered ?? value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(null)}
            className={`transition-transform ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              size={20}
              className={
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 dark:text-gray-600 fill-transparent'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
