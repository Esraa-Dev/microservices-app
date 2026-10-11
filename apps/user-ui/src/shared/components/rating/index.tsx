
import { Star } from "lucide-react";

type RatingProps = {
  rating: number;
};

const Rating = ({ rating }: RatingProps) => {
  const safeRating = Math.min(5, Math.max(0, rating));

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rated ${safeRating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fillPercentage = Math.min(
          100,
          Math.max(0, (safeRating - index) * 100)
        );

        return (
          <div key={index} className="relative h-4 w-4">
            <Star
              size={16}
              className="absolute inset-0 text-border"
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                size={16}
                className="max-w-none fill-primary text-primary"
              />
            </div>
          </div>
        );
      })}

      <span className="ml-1 text-sm font-medium text-primary-text">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
};

export default Rating;
