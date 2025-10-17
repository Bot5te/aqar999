import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import translations from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  return (
    <Card className={cn("overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group", className)}>
      <div className="relative">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-primary text-white py-1 px-3 rounded-full text-sm">
          {property.isRental ? translations.property.forRent : translations.property.forSale}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 bg-white/80 hover:bg-white text-neutral-700 w-9 h-9 rounded-full flex items-center justify-center"
          onClick={toggleFavorite}
        >
          <i className={cn(
            isFavorite ? "fas fa-heart text-red-500" : "far fa-heart"
          )}></i>
        </Button>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-neutral-800">{property.title}</h3>
          <span className="text-primary font-bold text-lg">
            {formatCurrency(property.price, property.currency)}
            {property.isRental && property.rentalPeriod === "yearly" && (
              <span className="text-sm text-neutral-600 font-normal mr-1">/{translations.property.yearlyRent}</span>
            )}
          </span>
        </div>
        
        <p className="text-neutral-600 text-sm mb-4">
          <i className="fas fa-map-marker-alt ml-1"></i>
          {property.neighborhood}، {property.city}
        </p>
        
        <div className="flex justify-start text-neutral-700 text-sm mb-4">
          <span><i className="fas fa-ruler-combined ml-1"></i> {property.size} م²</span>
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            <i className="far fa-clock ml-1"></i> {formatDate(property.createdAt)}
          </div>
          <Link href={`/property/${String(property._id || property.id)}`} className="text-primary hover:text-primary/80 font-medium text-sm" data-testid="link-property-details">
            {translations.common.viewDetails}
          </Link>
        </div>
      </div>
    </Card>
  );
}
