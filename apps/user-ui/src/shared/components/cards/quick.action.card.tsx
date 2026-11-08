import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}: QuickActionCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-4 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:shadow-sm"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>

      <div className="flex-1 space-y-1">
        <h3 className="font-semibold text-primary-text">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-secondary-text">
          {description}
        </p>
      </div>
    </button>
  );
};

export default QuickActionCard;