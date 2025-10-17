import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSearch from "@/components/hero-search";
import PropertyCard from "@/components/property-card";
import ServiceCard from "@/components/service-card";
import TestimonialCard from "@/components/testimonial-card";
import ContactForm from "@/components/contact-form";
import StatsSection from "@/components/stats-section";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Property, Testimonial } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import translations from "@/lib/i18n";

export default function Home() {
  // Fetch featured properties
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });

  // Fetch testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              أفضل العقارات في المملكة العربية السعودية
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              ابحث عن منزل أحلامك أو استثمر في أفضل العقارات بأسعار تنافسية
            </p>
            
            {/* Search Form */}
            <HeroSearch />
          </div>
        </div>
      </section>
      
      {/* Featured Properties */}
      <section id="properties" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-neutral-800 mb-2">عقارات مميزة</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              اكتشف أفضل العقارات المتاحة في مختلف مناطق المملكة العربية السعودية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingProperties ? (
              // Loading skeleton
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <Skeleton className="w-full h-64" />
                  <div className="p-5">
                    <Skeleton className="h-7 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-px w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              properties?.map((property) => (
                <PropertyCard key={String(property._id || property.id)} property={property} />
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/properties">
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-lg px-6 py-3 transition-colors">
                عرض جميع العقارات
                <i className="fas fa-arrow-left mr-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Services */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-neutral-800 mb-2">خدماتنا العقارية</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              نقدم مجموعة متكاملة من الخدمات العقارية لتلبية احتياجاتك
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon="fas fa-home" 
              title="بيع وشراء العقارات" 
              description="نساعدك في بيع أو شراء العقارات بأفضل الأسعار وبإجراءات قانونية سليمة"
            />
            <ServiceCard 
              icon="fas fa-key" 
              title="تأجير العقارات" 
              description="خدمات تأجير احترافية للمالكين والمستأجرين مع إدارة كاملة للعقود"
            />
            <ServiceCard 
              icon="fas fa-chart-line" 
              title="الاستثمار العقاري" 
              description="استشارات متخصصة في الاستثمار العقاري ودراسات الجدوى للمشاريع"
            />
            <ServiceCard 
              icon="fas fa-calculator" 
              title="التقييم العقاري" 
              description="تقييم دقيق للعقارات بناءً على معايير مهنية ودراسة السوق"
            />
            <ServiceCard 
              icon="fas fa-file-contract" 
              title="الخدمات القانونية" 
              description="استشارات قانونية متخصصة في صياغة العقود وتوثيق الملكية"
            />
            <ServiceCard 
              icon="fas fa-building" 
              title="إدارة الأملاك" 
              description="خدمات إدارة كاملة للعقارات وصيانتها وتحصيل الإيجارات"
            />
          </div>
        </div>
      </section>
      
      {/* Stats */}
      <StatsSection 
        stats={[
          { value: "1200+", label: "عقار مباع" },
          { value: "850+", label: "عميل راضٍ" },
          { value: "15+", label: "سنة خبرة" },
          { value: "25+", label: "مدينة" },
        ]}
      />
      
      {/* Testimonials */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-neutral-800 mb-2">آراء عملائنا</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              تعرف على تجارب عملائنا مع خدماتنا العقارية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoadingTestimonials ? (
              // Loading skeleton
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 custom-shadow">
                  <div className="flex items-center mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="mr-3">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            ) : (
              testimonials?.map((testimonial) => (
                <TestimonialCard key={String(testimonial._id || testimonial.id)} testimonial={testimonial} />
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold font-heading text-neutral-800 mb-6">تواصل معنا</h2>
                <p className="text-neutral-600 mb-8">
                  هل لديك أي استفسار حول خدماتنا أو ترغب في الحصول على استشارة عقارية؟ لا تتردد في التواصل معنا.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                    </div>
                    <div className="mr-4">
                      <h4 className="font-bold text-neutral-800 mb-1">العنوان</h4>
                      <p className="text-neutral-600">
                        حي الملز، شارع الأمير ناصر بن فرحان، الرياض، المملكة العربية السعودية
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-phone-alt text-primary"></i>
                    </div>
                    <div className="mr-4">
                      <h4 className="font-bold text-neutral-800 mb-1">رقم الهاتف</h4>
                      <p className="text-neutral-600 dir-ltr">+966 11 234 5678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-envelope text-primary"></i>
                    </div>
                    <div className="mr-4">
                      <h4 className="font-bold text-neutral-800 mb-1">البريد الإلكتروني</h4>
                      <p className="text-neutral-600">info@aldar-realestate.sa</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-clock text-primary"></i>
                    </div>
                    <div className="mr-4">
                      <h4 className="font-bold text-neutral-800 mb-1">ساعات العمل</h4>
                      <p className="text-neutral-600">الأحد - الخميس: 9:00 ص - 5:00 م</p>
                      <p className="text-neutral-600">السبت: 10:00 ص - 2:00 م</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <a href="#" className="w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center transition-colors">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center transition-colors">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center transition-colors">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center transition-colors">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-xl font-bold font-heading text-neutral-800 mb-6">أرسل رسالة</h3>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
