import React from 'react';
import { Star } from 'lucide-react';

const Rating = ({ rating }:any) => {
  return (
    <div className="flex items-center gap-3 dir-rtl">
      <span className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</span>

      <div className="flex gap-0.5 text-primary">
        {[...Array(5)].map((_, index) => {
          const starNumber = index + 1;
          
          if (starNumber <= rating) {
            return <Star key={index} size={20} fill="currentColor" className="text-primary" />;
          }
          
          if (starNumber - 1 < rating && starNumber > rating) {
            const fillPercentage = (rating % 1) * 100;
            const gradientId = `star-grad-${fillPercentage}`;

            return (
              <svg key={index} width="20" height="20" viewBox="0 0 24 24" className="text-primary">
                <defs>
                  <linearGradient id={gradientId}>
                    <stop offset={`${fillPercentage}%`} stopColor="currentColor" />
                    <stop offset={`${fillPercentage}%`} stopColor="#E5E7EB" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={`url(#${gradientId})`}
                />
              </svg>
            );
          }

          return <Star key={index} size={20} fill="#E5E7EB" className="text-gray-200" />;
        })}
      </div>

    </div>
  );
};

export default Rating;