import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function ServiceCard({ icon, title, description, className }: ServiceCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
          <i className={`${icon} text-primary text-2xl`}></i>
        </div>
        <h3 className="text-xl font-bold text-center mb-3 font-heading">{title}</h3>
        <p className="text-center text-neutral-600">{description}</p>
      </CardContent>
    </Card>
  );
}
