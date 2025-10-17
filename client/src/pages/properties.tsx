import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Property, PropertySearch, cityStructure } from "@shared/schema";
import { getCities, getPropertyTypes } from "@/lib/utils";
import translations from "@/lib/i18n";

export default function Properties() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<PropertySearch>({});
  const [sortBy, setSortBy] = useState("newest");
  const [areas, setAreas] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Update areas when city changes
  useEffect(() => {
    if (searchParams.city && searchParams.city !== 'all' && cityStructure[searchParams.city]) {
      setAreas(Object.keys(cityStructure[searchParams.city]));
    } else {
      setAreas([]);
      setSearchParams(prev => ({ ...prev, area: undefined, neighborhood: undefined }));
    }
  }, [searchParams.city]);

  // Update neighborhoods when area changes
  useEffect(() => {
    if (searchParams.city && searchParams.area && searchParams.area !== 'all' && 
        cityStructure[searchParams.city] && cityStructure[searchParams.city][searchParams.area]) {
      setNeighborhoods(cityStructure[searchParams.city][searchParams.area]);
    } else {
      setNeighborhoods([]);
      setSearchParams(prev => ({ ...prev, neighborhood: undefined }));
    }
  }, [searchParams.city, searchParams.area]);

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    
    const newSearchParams: PropertySearch = {};
    
    if (params.get("city")) newSearchParams.city = params.get("city") as string;
    if (params.get("area")) newSearchParams.area = params.get("area") as string;
    if (params.get("neighborhood")) newSearchParams.neighborhood = params.get("neighborhood") as string;
    if (params.get("type")) newSearchParams.type = params.get("type") as string;
    if (params.get("minPrice")) newSearchParams.minPrice = parseFloat(params.get("minPrice") as string);
    if (params.get("maxPrice")) newSearchParams.maxPrice = parseFloat(params.get("maxPrice") as string);
    if (params.get("minSize")) newSearchParams.minSize = parseFloat(params.get("minSize") as string);
    if (params.get("maxSize")) newSearchParams.maxSize = parseFloat(params.get("maxSize") as string);
    if (params.get("isRental")) newSearchParams.isRental = params.get("isRental") === "true";
    if (params.get("bedrooms")) newSearchParams.bedrooms = parseInt(params.get("bedrooms") as string);
    
    setSearchParams(newSearchParams);
  }, [location]);

  // Fetch properties based on search params
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/search', searchParams],
    queryFn: async ({ queryKey }) => {
      const [_, searchParams] = queryKey;
      const params = new URLSearchParams();
      
      // Add search params to query
      Object.entries(searchParams as PropertySearch).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          params.append(key, String(value));
        }
      });
      
      const res = await fetch(`/api/properties/search?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      return res.json();
    },
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Add search params to URL
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, String(value));
      }
    });
    
    navigate(`/properties?${params.toString()}`);
  };

  // Sort properties based on selected option
  const sortedProperties = () => {
    if (!properties) return [];
    
    const sorted = [...properties];
    
    switch (sortBy) {
      case "priceHighToLow":
        return sorted.sort((a, b) => b.price - a.price);
      case "priceLowToHigh":
        return sorted.sort((a, b) => a.price - b.price);
      case "sizeHighToLow":
        return sorted.sort((a, b) => b.size - a.size);
      case "newest":
      default:
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  return (
    <>
      <Header />
      
      {/* Page Header */}
      <div className="bg-primary dark:bg-primary-dark py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white font-heading mb-2" data-testid="text-page-title">جميع العقارات</h1>
          <div className="text-white/80">الرئيسية / العقارات</div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Search Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6 font-heading dark:text-white">البحث المتقدم</h3>
              
              <form onSubmit={handleSearch}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">المدينة</label>
                    <Select 
                      value={searchParams.city} 
                      onValueChange={(value) => setSearchParams({...searchParams, city: value, area: undefined, neighborhood: undefined})}
                    >
                      <SelectTrigger data-testid="select-city-filter">
                        <SelectValue placeholder="جميع المدن" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المدن</SelectItem>
                        {getCities().map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">المنطقة</label>
                    <Select 
                      value={searchParams.area} 
                      onValueChange={(value) => setSearchParams({...searchParams, area: value, neighborhood: undefined})}
                      disabled={!searchParams.city || searchParams.city === 'all'}
                    >
                      <SelectTrigger data-testid="select-area-filter">
                        <SelectValue placeholder={!searchParams.city || searchParams.city === 'all' ? "اختر المدينة أولاً" : "جميع المناطق"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المناطق</SelectItem>
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">الحي</label>
                    <Select 
                      value={searchParams.neighborhood} 
                      onValueChange={(value) => setSearchParams({...searchParams, neighborhood: value})}
                      disabled={!searchParams.area || searchParams.area === 'all'}
                    >
                      <SelectTrigger data-testid="select-neighborhood-filter">
                        <SelectValue placeholder={!searchParams.area || searchParams.area === 'all' ? "اختر المنطقة أولاً" : "جميع الأحياء"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأحياء</SelectItem>
                        {neighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">نوع العقار</label>
                    <Select 
                      value={searchParams.type} 
                      onValueChange={(value) => setSearchParams({...searchParams, type: value})}
                    >
                      <SelectTrigger data-testid="select-type-filter">
                        <SelectValue placeholder="جميع الأنواع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        {getPropertyTypes().map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">نطاق السعر (ريال)</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="من"
                        value={searchParams.minPrice || ''}
                        onChange={(e) => setSearchParams({...searchParams, minPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-1/2"
                        data-testid="input-min-price-filter"
                      />
                      <Input
                        type="number"
                        placeholder="إلى"
                        value={searchParams.maxPrice || ''}
                        onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-1/2"
                        data-testid="input-max-price-filter"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">نطاق المساحة (م²)</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="من"
                        value={searchParams.minSize || ''}
                        onChange={(e) => setSearchParams({...searchParams, minSize: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-1/2"
                        data-testid="input-min-size-filter"
                      />
                      <Input
                        type="number"
                        placeholder="إلى"
                        value={searchParams.maxSize || ''}
                        onChange={(e) => setSearchParams({...searchParams, maxSize: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-1/2"
                        data-testid="input-max-size-filter"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">نوع العرض</label>
                    <Select 
                      value={searchParams.isRental === true ? "rental" : searchParams.isRental === false ? "sale" : "all"} 
                      onValueChange={(value) => setSearchParams({
                        ...searchParams, 
                        isRental: value === "rental" ? true : value === "sale" ? false : undefined
                      })}
                    >
                      <SelectTrigger data-testid="select-listing-type">
                        <SelectValue placeholder="الكل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="sale">للبيع</SelectItem>
                        <SelectItem value="rental">للإيجار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">عدد غرف النوم (على الأقل)</label>
                    <Input
                      type="number"
                      min="0"
                      value={searchParams.bedrooms || ''}
                      onChange={(e) => setSearchParams({
                        ...searchParams, 
                        bedrooms: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="أي عدد"
                      data-testid="input-bedrooms"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" data-testid="button-apply-filters">
                    تطبيق الفلاتر
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-400" data-testid="text-results-count">
                {isLoading ? 'جاري التحميل...' : `عدد النتائج: ${sortedProperties().length}`}
              </p>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">ترتيب حسب:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="priceHighToLow">الأعلى سعراً</SelectItem>
                    <SelectItem value="priceLowToHigh">الأقل سعراً</SelectItem>
                    <SelectItem value="sizeHighToLow">الأكبر مساحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : sortedProperties().length === 0 ? (
              <div className="text-center py-12" data-testid="text-no-results">
                <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد عقارات تطابق معايير البحث</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProperties().map((property) => (
                  <PropertyCard key={property._id || property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
