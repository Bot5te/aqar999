import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import translations from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className={cn("col-span-12 md:col-span-3 lg:col-span-2 bg-neutral-800 h-full min-h-screen", className)}>
      <div className="p-4 bg-primary">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold font-heading">
            لوحة التحكم
          </span>
        </div>
      </div>

      <div className="pt-4">
        <div className="px-4 pb-4 mb-4 border-b border-neutral-700">
          <div className="text-white font-medium font-heading">مرحباً، {user?.name}</div>
          <div className="text-gray-400 text-sm">{user?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</div>
        </div>
        
        <nav className="py-2">
          <ul className="space-y-1">
            <li>
              <Link href="/panel">
                <a className={cn(
                  "flex items-center px-4 py-3 hover:bg-neutral-700/10 transition-colors",
                  location === "/panel" 
                    ? "text-white bg-primary/20 border-r-4 border-primary" 
                    : "text-gray-300 hover:text-white"
                )}>
                  <i className="fas fa-home ml-3"></i>
                  <span>{translations.admin.dashboard}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/panel/properties">
                <a className={cn(
                  "flex items-center px-4 py-3 hover:bg-neutral-700/10 transition-colors",
                  location.startsWith("/panel/properties")
                    ? "text-white bg-primary/20 border-r-4 border-primary" 
                    : "text-gray-300 hover:text-white"
                )}>
                  <i className="fas fa-building ml-3"></i>
                  <span>{translations.admin.manageProperties}</span>
                </a>
              </Link>
            </li>
            <li>
              <a href="#users" className="flex items-center px-4 py-3 text-gray-300 hover:bg-neutral-700/10 hover:text-white transition-colors">
                <i className="fas fa-users ml-3"></i>
                <span>{translations.admin.manageUsers}</span>
              </a>
            </li>
            <li>
              <a href="#messages" className="flex items-center px-4 py-3 text-gray-300 hover:bg-neutral-700/10 hover:text-white transition-colors">
                <i className="fas fa-envelope ml-3"></i>
                <span>{translations.admin.messages}</span>
              </a>
            </li>
            <li>
              <a href="#settings" className="flex items-center px-4 py-3 text-gray-300 hover:bg-neutral-700/10 hover:text-white transition-colors">
                <i className="fas fa-cog ml-3"></i>
                <span>{translations.admin.settings}</span>
              </a>
            </li>
            <li className="pt-4 mt-4 border-t border-neutral-700">
              <Button 
                variant="ghost" 
                className="flex w-full items-center justify-start px-4 py-3 text-gray-300 hover:bg-neutral-700/10 hover:text-white transition-colors"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 ml-3" />
                <span>{translations.common.logout}</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
