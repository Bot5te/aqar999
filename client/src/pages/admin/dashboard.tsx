import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Property, ContactMessage } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import translations from "@/lib/i18n";
import { formatCurrency, formatDate, truncateText } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Fetch properties
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  // Fetch contact messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact'],
  });
  
  // Calculate statistics
  const stats = {
    totalProperties: properties?.length || 0,
    availableProperties: properties?.filter(p => p.status === 'available').length || 0,
    forSale: properties?.filter(p => !p.isRental).length || 0,
    forRent: properties?.filter(p => p.isRental).length || 0,
    totalMessages: messages?.length || 0,
    unreadMessages: messages?.filter(m => !m.isRead).length || 0,
  };
  
  // Get recent properties (last 5)
  const recentProperties = properties?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  
  // Get recent messages (last 5)
  const recentMessages = messages?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading text-neutral-800 mb-2">
            {translations.admin.dashboard}
          </h1>
          <p className="text-neutral-600">
            {translations.admin.welcomeBack}, {user?.name}
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{translations.admin.totalProperties}</p>
                  {isLoadingProperties ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold">{stats.totalProperties}</h3>
                  )}
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-building text-primary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">عقارات للبيع</p>
                  {isLoadingProperties ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold">{stats.forSale}</h3>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <i className="fas fa-tag text-blue-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">عقارات للإيجار</p>
                  {isLoadingProperties ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold">{stats.forRent}</h3>
                  )}
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <i className="fas fa-key text-amber-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">عقارات متاحة</p>
                  {isLoadingProperties ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold">{stats.availableProperties}</h3>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{translations.admin.totalMessages}</p>
                  {isLoadingMessages ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                  <i className="fas fa-envelope text-purple-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">رسائل غير مقروءة</p>
                  {isLoadingMessages ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold">{stats.unreadMessages}</h3>
                  )}
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <i className="fas fa-envelope-open text-red-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">
                  {translations.admin.recentProperties}
                </CardTitle>
                <Link href="/panel/properties">
                  <Button variant="ghost" size="sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingProperties ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center p-2">
                      <Skeleton className="h-10 w-10 rounded-md ml-4" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentProperties?.length ? (
                <div className="space-y-1">
                  {recentProperties.map((property) => (
                    <div 
                      key={String(property._id || property.id)} 
                      className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden ml-4">
                        <img 
                          src={property.images[0]} 
                          alt={property.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-800 text-sm">{truncateText(property.title, 40)}</h4>
                        <p className="text-xs text-neutral-500">{property.city} - {formatDate(property.createdAt)}</p>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {formatCurrency(property.price, property.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  لا توجد عقارات لعرضها
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Messages */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">
                  {translations.admin.recentMessages}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start p-2">
                      <Skeleton className="h-10 w-10 rounded-full ml-4" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-1/2 mb-1" />
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentMessages?.length ? (
                <div className="space-y-1">
                  {recentMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className="flex items-start p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                        <span className="text-primary font-bold">{message.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-800 text-sm flex items-center">
                          {message.name}
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          )}
                        </h4>
                        <p className="text-xs text-neutral-500">{message.email}</p>
                        <p className="text-xs text-neutral-600 mt-1">{truncateText(message.message, 60)}</p>
                      </div>
                      <div className="text-xs text-neutral-500 flex-shrink-0">
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  لا توجد رسائل لعرضها
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
