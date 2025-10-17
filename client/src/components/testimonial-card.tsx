import { Card, CardContent } from "@/components/ui/card";
import { Testimonial } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export default function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="text-[#D4AF37]">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`star-${i}`} className="fas fa-star"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt"></i>}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <i key={`empty-star-${i}`} className="far fa-star"></i>
        ))}
      </div>
    );
  };

  // Get first letter of name for avatar
  const nameInitial = testimonial.name.charAt(0);

  return (
    <Card className={cn("bg-gray-50 custom-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-white font-bold">
            {nameInitial}
          </div>
          <div className="mr-3">
            <h4 className="font-bold">{testimonial.name}</h4>
            <p className="text-sm text-neutral-500">{testimonial.location}</p>
          </div>
        </div>
        <p className="text-neutral-600 mb-4">{testimonial.message}</p>
        {renderStars(testimonial.rating)}
      </CardContent>
    </Card>
  );
}
