import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import translations from "@/lib/i18n";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white shadow-md transition-all duration-300",
      isScrolled && "shadow-lg"
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex">
                <span className="text-primary text-3xl font-bold font-heading">الطخيم</span>
                <span className="text-primary mr-1 text-3xl font-bold font-heading">العالمية</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1 space-x-reverse text-base">
            <Link href="/" className={cn(
              "px-3 py-2 hover:text-primary transition-colors",
              location === "/" ? "text-primary font-semibold" : "text-neutral-700"
            )}>
              {translations.common.home}
            </Link>
            <Link href="/properties" className={cn(
              "px-3 py-2 hover:text-primary transition-colors",
              location === "/properties" ? "text-primary font-semibold" : "text-neutral-700"
            )}>
              {translations.common.properties}
            </Link>
            <Link href="/#services" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
              {translations.common.services}
            </Link>
            <Link href="/#about" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
              {translations.common.about}
            </Link>
            <Link href="/#contact" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
              {translations.common.contactUs}
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/panel">
                    <Button variant="outline" size="sm" className="hidden md:inline-flex">
                      {translations.common.dashboard}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => logout()} className="hidden md:inline-flex">
                  {translations.common.logout}
                </Button>
              </>
            ) : (
              <Link href="/login" className="hidden md:inline-flex">
                <Button variant="ghost" size="sm">
                  {translations.common.login}
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute w-full left-0 right-0 top-16 p-4 bg-white shadow-lg z-50">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className={cn(
                "px-3 py-2 hover:text-primary transition-colors",
                location === "/" ? "text-primary font-semibold" : "text-neutral-700"
              )}>
                {translations.common.home}
              </Link>
              <Link href="/properties" className={cn(
                "px-3 py-2 hover:text-primary transition-colors",
                location === "/properties" ? "text-primary font-semibold" : "text-neutral-700"
              )}>
                {translations.common.properties}
              </Link>
              <Link href="/#services" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
                {translations.common.services}
              </Link>
              <Link href="/#about" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
                {translations.common.about}
              </Link>
              <Link href="/#contact" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
                {translations.common.contactUs}
              </Link>
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/panel" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
                      {translations.common.dashboard}
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => logout()} 
                    className="text-right px-3 py-2 h-auto text-neutral-700 hover:text-primary"
                  >
                    {translations.common.logout}
                  </Button>
                </>
              ) : (
                <Link href="/login" className="px-3 py-2 text-neutral-700 hover:text-primary transition-colors">
                  {translations.common.login}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
