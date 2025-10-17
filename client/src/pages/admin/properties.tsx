import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/layout/sidebar";
import { Property } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getPropertyStatusBadgeColor } from "@/lib/utils";
import translations from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch all properties
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/properties/${id}`);
    },
    onSuccess: () => {
      toast({
        title: translations.property.propertyDeleted,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setPropertyToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Filter properties based on search term
  const filteredProperties = properties?.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.propertyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle property deletion
  const handleDelete = () => {
    if (propertyToDelete) {
      deleteMutation.mutate(Number(propertyToDelete._id || propertyToDelete.id));
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-neutral-800 mb-2">
              {translations.admin.manageProperties}
            </h1>
            <p className="text-neutral-600">
              إدارة جميع العقارات في الموقع
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Input
                placeholder="بحث عن عقار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-[240px]"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>
            
            <Link href="/panel/properties/new">
              <Button className="bg-primary hover:bg-primary/90">
                <i className="fas fa-plus ml-2"></i>
                {translations.property.addProperty}
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">العقار</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-md ml-4" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProperties?.length ? (
                  filteredProperties.map((property) => (
                    <TableRow key={String(property._id || property.id)}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 ml-4">
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={property.images[0]} 
                              alt={property.title}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-800">{property.title}</div>
                            <div className="text-sm text-neutral-500">رقم العقار: {property.propertyCode}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-800">
                          {translations.property.types[property.type as keyof typeof translations.property.types] || property.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-800">{property.city}</div>
                        <div className="text-sm text-neutral-500">{property.neighborhood}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-800">{formatCurrency(property.price, property.currency)}</div>
                        {property.isRental && (
                          <div className="text-xs text-neutral-500">{property.rentalPeriod}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPropertyStatusBadgeColor(property.status)}`}>
                          {translations.property.statuses[property.status as keyof typeof translations.property.statuses] || property.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-500">
                          {formatDate(property.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 space-x-reverse">
                          <Link href={`/panel/properties/edit/${property.id}`}>
                            <Button
                              variant="outline" 
                              size="sm" 
                              className="text-primary border-primary hover:bg-primary/10 ml-2"
                            >
                              <i className="fas fa-edit ml-1"></i>
                              تعديل
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-600 hover:bg-red-50 ml-2"
                            onClick={() => setPropertyToDelete(property)}
                          >
                            <i className="fas fa-trash-alt ml-1"></i>
                            حذف
                          </Button>
                          <Link href={`/property/${property.id}`} target="_blank">
                            <Button variant="outline" size="sm" className="text-neutral-600 border-neutral-300 hover:bg-neutral-50">
                              <i className="fas fa-eye ml-1"></i>
                              عرض
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                      {searchTerm ? (
                        <>
                          <div className="text-3xl mb-2">
                            <i className="fas fa-search"></i>
                          </div>
                          <p>لا توجد عقارات تطابق بحثك "{searchTerm}"</p>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">
                            <i className="fas fa-building"></i>
                          </div>
                          <p>لا توجد عقارات لعرضها</p>
                          <Link href="/panel/properties/new">
                            <Button variant="link" className="mt-2">إضافة عقار جديد</Button>
                          </Link>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.property.deleteProperty}</AlertDialogTitle>
            <AlertDialogDescription>
              {translations.property.areYouSure}
              <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                <strong>{propertyToDelete?.title}</strong>
                <div className="text-xs text-neutral-500">{propertyToDelete?.propertyCode}</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMutation.isPending ? (
                <>
                  <i className="fas fa-circle-notch fa-spin ml-2"></i>
                  جارِ الحذف...
                </>
              ) : (
                <>حذف</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
