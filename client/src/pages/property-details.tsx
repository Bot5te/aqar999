import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property-card";
import ContactForm from "@/components/contact-form";
import { formatCurrency, formatDate, getPropertyStatusBadgeColor } from "@/lib/utils";
import { Property } from "@shared/schema";
import translations from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Share2, Heart, MapPin, Badge, Calendar, Phone, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PropertyDetails() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const propertyId = params.id;
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch property details
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
  });

  // Fetch similar properties
  const { data: similarProperties, isLoading: isSimilarLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/search'],
    queryFn: async () => {
      // Only fetch if we have the main property
      if (!property) return [];
      
      const params = new URLSearchParams();
      params.append('city', property.city);
      params.append('type', property.type);
      params.append('isRental', String(property.isRental));
      
      const res = await fetch(`/api/properties/search?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const allProperties = await res.json();
      // Filter out the current property and limit to 3
      return allProperties
        .filter((p: Property) => (p._id || p.id) !== propertyId)
        .slice(0, 3);
    },
    enabled: !!property, // Only run query when property data is available
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [propertyId]);

  // Handle share property
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || 'عقار من الطخيم العالمية',
        text: property?.description || 'شاهد هذا العقار المميز',
        url: window.location.href,
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط العقار إلى الحافظة",
      });
    }
  };

  // Handle save to favorites
  const handleSaveToFavorites = () => {
    toast({
      title: "تمت الإضافة للمفضلة",
      description: "تم إضافة العقار إلى قائمة المفضلة",
    });
  };

  // Handle image gallery
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  const nextImage = () => {
    if (property && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') previousImage();
    if (e.key === 'ArrowLeft') nextImage();
    if (e.key === 'Escape') setGalleryOpen(false);
  };

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-5xl text-red-500 mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h1 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل تفاصيل العقار</h1>
          <p className="text-neutral-600 mb-8">
            {(error as Error).message || "يرجى المحاولة مرة أخرى لاحقاً"}
          </p>
          <Link href="/properties">
            <Button>العودة إلى قائمة العقارات</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Page Header */}
      <div className="bg-primary py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="text-white/80 mb-2">الرئيسية / العقارات / تفاصيل العقار</div>
              {isLoading ? (
                <Skeleton className="h-10 w-64" />
              ) : (
                <h1 className="text-3xl font-bold text-white font-heading">{property?.title}</h1>
              )}
            </div>
            {!isLoading && property && (
              <div className="mt-4 md:mt-0 text-xl font-bold text-white">
                {formatCurrency(property.price, property.currency)}
                {property.isRental && property.rentalPeriod === "yearly" && (
                  <span className="text-sm text-white/80 font-normal mr-1">/{translations.property.yearlyRent}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-[500px] rounded-lg mb-8" />
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <Skeleton className="h-10 w-64 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <Skeleton className="w-full h-[400px] rounded-lg" />
            </div>
          </div>
        ) : property ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Property Gallery */}
              <div className="mb-8">
                <div 
                  className="rounded-lg overflow-hidden cursor-pointer relative group"
                  onClick={() => openGallery(0)}
                  data-testid="image-main"
                >
                  <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="w-full h-[500px] object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="lg">
                        <i className="fas fa-search-plus ml-2"></i>
                        عرض الصور ({property.images.length})
                      </Button>
                    </div>
                  </div>
                </div>
                
                {property.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {property.images.slice(1, 5).map((image, index) => (
                      <div 
                        key={index} 
                        className="rounded-lg overflow-hidden cursor-pointer relative group"
                        onClick={() => openGallery(index + 1)}
                        data-testid={`image-thumbnail-${index + 1}`}
                      >
                        <img 
                          src={image} 
                          alt={`${property.title} - صورة ${index + 2}`} 
                          className="w-full h-24 object-cover transition-transform group-hover:scale-110"
                        />
                        {index === 3 && property.images.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                            +{property.images.length - 5}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Property Info */}
              <div className="mb-8">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-neutral-800 font-heading mb-2 md:mb-0">
                    {property.title}
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 ml-2" />
                      مشاركة
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSaveToFavorites}>
                      <Heart className="h-4 w-4 ml-2" />
                      حفظ
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <MapPin className="h-4 w-4 text-primary ml-2" />
                  <span className="text-neutral-600">
                    {property.neighborhood}، {property.city}
                  </span>
                </div>
                
                <div className="flex items-center mb-6">
                  <Badge className="h-4 w-4 text-primary ml-2" />
                  <span className="text-neutral-600 ml-4">
                    {translations.property.code}: {property.propertyCode}
                  </span>
                  <Calendar className="h-4 w-4 text-primary mr-4 ml-2" />
                  <span className="text-neutral-600">
                    {formatDate(property.createdAt)}
                  </span>
                </div>
                
                <div className="mb-6">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPropertyStatusBadgeColor(property.status)}`}>
                    {property.isRental ? translations.property.forRent : translations.property.forSale}
                  </div>
                </div>
                
                <div className="border-t border-b border-gray-200 py-6 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                    {property.type && (
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ml-3">
                          <i className={`fas fa-home text-primary`}></i>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-500">النوع</div>
                          <div className="font-medium">
                            {translations.property.types[property.type as keyof typeof translations.property.types] || property.type}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ml-3">
                        <i className="fas fa-ruler-combined text-primary"></i>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-500">المساحة</div>
                        <div className="font-medium">{property.size} م²</div>
                      </div>
                    </div>
                    
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ml-3">
                          <i className="fas fa-bed text-primary"></i>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-500">غرف النوم</div>
                          <div className="font-medium">{property.bedrooms}</div>
                        </div>
                      </div>
                    )}
                    
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ml-3">
                          <i className="fas fa-bath text-primary"></i>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-500">الحمامات</div>
                          <div className="font-medium">{property.bathrooms}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ml-3">
                        <i className="fas fa-map-marker-alt text-primary"></i>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-500">المدينة</div>
                        <div className="font-medium">{property.city}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ml-3">
                        <i className={`fas fa-${property.isRental ? 'key' : 'tag'} text-primary`}></i>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-500">نوع العرض</div>
                        <div className="font-medium">{property.isRental ? 'للإيجار' : 'للبيع'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Property Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-neutral-800 font-heading mb-4">
                    {translations.property.propertyDetails}
                  </h3>
                  <p className="text-neutral-600 whitespace-pre-line leading-relaxed">
                    {property.description}
                  </p>
                </div>
                
                {/* Property Features */}
                {property.features && property.features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-neutral-800 font-heading mb-4">
                      {translations.property.features}
                    </h3>
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                      {property.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <i className="fas fa-check-circle text-primary ml-2"></i>
                          <span className="text-neutral-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Similar Properties */}
              {similarProperties && similarProperties.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-neutral-800 font-heading mb-6">
                    عقارات مشابهة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {similarProperties.map((property) => (
                      <PropertyCard key={String(property._id || property.id)} property={property} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-bold text-neutral-800 font-heading mb-6">
                  تواصل مع المسؤول
                </h3>
                
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center ml-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500">للاستفسار اتصل على</div>
                      <div className="font-bold text-lg">+966 11 234 5678</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <i className="fab fa-whatsapp text-green-500 ml-2"></i>
                    تواصل عبر واتساب
                  </Button>
                </div>
                
                <ContactForm />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl text-neutral-300 mb-4">
              <i className="fas fa-home"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2">العقار غير موجود</h2>
            <p className="text-neutral-600 mb-8">يبدو أن العقار الذي تبحث عنه غير موجود أو تم حذفه</p>
            <Link href="/properties">
              <Button>العودة إلى قائمة العقارات</Button>
            </Link>
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Image Gallery Dialog */}
      {property && (
        <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
          <DialogContent 
            className="max-w-6xl w-full h-[90vh] p-0 bg-black/95"
            onKeyDown={handleKeyDown}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 z-50 text-white hover:bg-white/20"
                onClick={() => setGalleryOpen(false)}
                data-testid="button-close-gallery"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image Counter */}
              <div className="absolute top-4 right-4 z-50 bg-black/60 text-white px-4 py-2 rounded-lg">
                {currentImageIndex + 1} / {property.images.length}
              </div>

              {/* Previous Button */}
              {currentImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                  onClick={previousImage}
                  data-testid="button-previous-image"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Next Button */}
              {currentImageIndex < property.images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                  onClick={nextImage}
                  data-testid="button-next-image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {/* Main Image */}
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.title} - صورة ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                data-testid={`gallery-image-${currentImageIndex}`}
              />

              {/* Thumbnails */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 overflow-x-auto max-w-[90%] bg-black/60 p-2 rounded-lg">
                {property.images.map((image, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      index === currentImageIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    data-testid={`gallery-thumbnail-${index}`}
                  >
                    <img
                      src={image}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
