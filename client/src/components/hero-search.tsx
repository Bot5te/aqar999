import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCities, getPropertyTypes } from "@/lib/utils";
import { cityStructure } from "@shared/schema";
import translations from "@/lib/i18n";

export default function HeroSearch() {
  const [, navigate] = useLocation();
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Update areas when city changes
  useEffect(() => {
    if (city && city !== 'all' && cityStructure[city]) {
      setAreas(Object.keys(cityStructure[city]));
      setArea(""); // Reset area when city changes
      setNeighborhood(""); // Reset neighborhood when city changes
      setNeighborhoods([]);
    } else {
      setAreas([]);
      setArea("");
      setNeighborhood("");
      setNeighborhoods([]);
    }
  }, [city]);

  // Update neighborhoods when area changes
  useEffect(() => {
    if (city && area && area !== 'all' && cityStructure[city] && cityStructure[city][area]) {
      setNeighborhoods(cityStructure[city][area]);
      setNeighborhood(""); // Reset neighborhood when area changes
    } else {
      setNeighborhoods([]);
      setNeighborhood("");
    }
  }, [city, area]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (city && city !== 'all') params.append("city", city);
    if (area && area !== 'all') params.append("area", area);
    if (neighborhood && neighborhood !== 'all') params.append("neighborhood", neighborhood);
    if (propertyType && propertyType !== 'all') params.append("type", propertyType);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (minSize) params.append("minSize", minSize);
    if (maxSize) params.append("maxSize", maxSize);
    
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg" data-testid="hero-search">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label htmlFor="city" className="block text-neutral-700 dark:text-neutral-300 text-sm mb-1 font-medium">
              المدينة
            </label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger id="city" className="w-full" data-testid="select-city">
                <SelectValue placeholder="جميع المدن" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {getCities().map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="area" className="block text-neutral-700 dark:text-neutral-300 text-sm mb-1 font-medium">
              المنطقة
            </label>
            <Select value={area} onValueChange={setArea} disabled={!city || city === 'all'}>
              <SelectTrigger id="area" className="w-full" data-testid="select-area">
                <SelectValue placeholder={!city || city === 'all' ? "اختر المدينة أولاً" : "جميع المناطق"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المناطق</SelectItem>
                {areas.map((areaName) => (
                  <SelectItem key={areaName} value={areaName}>
                    {areaName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="neighborhood" className="block text-neutral-700 dark:text-neutral-300 text-sm mb-1 font-medium">
              الحي
            </label>
            <Select value={neighborhood} onValueChange={setNeighborhood} disabled={!area || area === 'all'}>
              <SelectTrigger id="neighborhood" className="w-full" data-testid="select-neighborhood">
                <SelectValue placeholder={!area || area === 'all' ? "اختر المنطقة أولاً" : "جميع الأحياء"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأحياء</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="propertyType" className="block text-neutral-700 dark:text-neutral-300 text-sm mb-1 font-medium">
              نوع العقار
            </label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="propertyType" className="w-full" data-testid="select-type">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {getPropertyTypes().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="block text-neutral-700 dark:text-neutral-300 text-sm mb-1 font-medium">
              نطاق السعر (ريال)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="من"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2"
                data-testid="input-min-price"
              />
              <Input
                type="number"
                placeholder="إلى"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2"
                data-testid="input-max-price"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-neutral-700 dark:text-neutral-300 text-sm mb-1 font-medium">
              نطاق المساحة (م²)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="من"
                value={minSize}
                onChange={(e) => setMinSize(e.target.value)}
                className="w-1/2"
                data-testid="input-min-size"
              />
              <Input
                type="number"
                placeholder="إلى"
                value={maxSize}
                onChange={(e) => setMaxSize(e.target.value)}
                className="w-1/2"
                data-testid="input-max-size"
              />
            </div>
          </div>

          <div className="flex items-end md:col-span-2">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10"
              data-testid="button-search"
            >
              <i className="fas fa-search ml-2"></i>
              ابحث الآن
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
