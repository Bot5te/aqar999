import { cn } from "@/lib/utils";

interface StatsItem {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: StatsItem[];
  className?: string;
}

export default function StatsSection({ stats, className }: StatsSectionProps) {
  return (
    <section className={cn("py-16 bg-primary text-white", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <p className="text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
