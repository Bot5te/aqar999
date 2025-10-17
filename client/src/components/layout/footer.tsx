import { Link } from "wouter";
import translations from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال بريد إلكتروني صحيح",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would send this to an API
    toast({
      title: "تم الاشتراك بنجاح",
      description: "شكراً لاشتراكك في النشرة البريدية",
    });
    
    setEmail("");
  };

  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center mb-6">
              <div className="flex">
                <span className="text-white text-3xl font-bold font-heading">الطخيم</span>
                <span className="text-white mr-1 text-3xl font-bold font-heading">العالمية</span>
              </div>
            </Link>
            <p className="text-gray-300 mb-6">
              شركة رائدة في مجال العقارات في المملكة العربية السعودية، نقدم خدمات عقارية متكاملة لعملائنا منذ أكثر من 15 عاماً.
            </p>
            
            {/* WhatsApp Contact Button */}
            <div className="mb-4">
              <a 
                href="https://wa.me/966551499084" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors w-fit"
              >
                <i className="fab fa-whatsapp text-xl"></i>
                <span>تواصل معنا عبر واتساب</span>
              </a>
            </div>
            
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 font-heading">روابط سريعة</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">{translations.common.home}</Link></li>
              <li><Link href="/properties" className="text-gray-300 hover:text-white transition-colors">{translations.common.properties}</Link></li>
              <li><Link href="/#services" className="text-gray-300 hover:text-white transition-colors">{translations.common.services}</Link></li>
              <li><Link href="/#about" className="text-gray-300 hover:text-white transition-colors">{translations.common.about}</Link></li>
              <li><Link href="/#contact" className="text-gray-300 hover:text-white transition-colors">{translations.common.contactUs}</Link></li>
              <li><Link href="/login" className="text-gray-300 hover:text-white transition-colors">{translations.common.login}</Link></li>
            </ul>
          </div>
          
          {/* Property Types */}
          <div>
            <h3 className="text-xl font-bold mb-6 font-heading">العقارات</h3>
            <ul className="space-y-3">
              <li><Link href="/properties?type=villa" className="text-gray-300 hover:text-white transition-colors">فلل للبيع</Link></li>
              <li><Link href="/properties?isRental=true&type=apartment" className="text-gray-300 hover:text-white transition-colors">شقق للإيجار</Link></li>
              <li><Link href="/properties?type=land" className="text-gray-300 hover:text-white transition-colors">أراضي للبيع</Link></li>
              <li><Link href="/properties?type=commercial" className="text-gray-300 hover:text-white transition-colors">عقارات تجارية</Link></li>
              <li><Link href="/properties?priceRange=2000000%2B" className="text-gray-300 hover:text-white transition-colors">عقارات فاخرة</Link></li>
              <li><Link href="/properties?featured=true" className="text-gray-300 hover:text-white transition-colors">عروض خاصة</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6 font-heading">اشترك في النشرة البريدية</h3>
            <p className="text-gray-300 mb-4">اشترك ليصلك أحدث العروض العقارية والأخبار</p>
            <form className="mb-6" onSubmit={handleSubscribe}>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="البريد الإلكتروني" 
                  className="rounded-r-lg rounded-l-none w-full focus:outline-none text-neutral-800 px-4" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-r-none text-white">
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
            </form>
            <div>
              <p className="text-gray-300 mb-2">وسائل الدفع المقبولة</p>
              <div className="flex gap-2">
                <i className="fab fa-cc-visa text-2xl text-gray-300"></i>
                <i className="fab fa-cc-mastercard text-2xl text-gray-300"></i>
                <i className="fab fa-cc-amex text-2xl text-gray-300"></i>
                <i className="fas fa-money-bill-alt text-2xl text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-8 mt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2023 الطخيم العالمية. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">سياسة الخصوصية</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">الشروط والأحكام</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">سياسة الاسترجاع</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
