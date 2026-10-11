
import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-primary-text">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-2 text-sm md:text-base text-secondary-text">
          {subtitle}
        </p>
      )}

      <div className="mt-3 h-1 w-14 rounded-full bg-primary" />
    </div>
  );
};

export default SectionTitle;
