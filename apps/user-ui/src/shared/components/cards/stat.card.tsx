import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
}

const StatsCard = ({ title, count, icon: Icon }: StatsCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-secondary-text">
          {title}
        </p>

        <h3 className="text-2xl font-semibold text-primary-text">
          {count}
        </h3>    
      </div>

      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="size-6 text-primary" />
      </div>
    </div>
  );
};

export default StatsCard;