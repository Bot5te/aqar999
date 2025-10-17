import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { X, Loader2 } from "lucide-react";
import { insertPropertySchema, Property } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { createPropertyCode, getCities, getPropertyTypes, getAreas, getNeighborhoods } from "@/lib/utils";
import Sidebar from "@/components/layout/sidebar";
import translations from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

// Extend the validation schema with required fields
const propertyFormSchema = insertPropertySchema.extend({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  description: z.string().min(20, "الوصف يجب أن يكون 20 حرف على الأقل"),
  city: z.string().min(1, "يرجى اختيار المدينة"),
  area: z.string().min(1, "يرجى اختيار المنطقة"),
  neighborhood: z.string().min(1, "يرجى اختيار الحي"),
  type: z.string().min(1, "يرجى اختيار نوع العقار"),
  price: z.coerce.number().min(1, "يرجى إدخال السعر"),
  size: z.coerce.number().min(1, "يرجى إدخال المساحة"),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function PropertyForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const isEditing = !!params.id;
  
  // Fetch property data if editing
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${params.id}`],
    enabled: isEditing
  });
  
  // Handle query error
  useEffect(() => {
    if (error) {
      toast({
        title: "خطأ في جلب العقار",
        description: (error as Error).message,
        variant: "destructive",
      });
      console.error("Error fetching property:", error);
    }
  }, [error, toast]);
  
  // Create property form
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      price: 0,
      currency: "SAR",
      isRental: false,
      rentalPeriod: "",
      city: "",
      area: "",
      neighborhood: "",
      address: "",
      bedrooms: 0,
      bathrooms: 0,
      size: 0,
      features: [],
      images: [],
      status: "available",
      propertyCode: createPropertyCode(),
    },
  });
  
  // Set form default values from property data
  useEffect(() => {
    if (property) {
      // Cast to any to avoid TypeScript errors with dynamic properties
      const propertyData = property as any;
      
      // First reset the form
      form.reset({
        ...property,
        features: [],
        images: [],
      });
      
      // Set features and images separately
      setFeatures(propertyData.features || []);
      setImages(propertyData.images || []);
      
      // Set selected city and area for cascading selects
      if (property.city) setSelectedCity(property.city);
      if (property.area) setSelectedArea(property.area);
    }
  }, [property, form]);
  
  // Add feature to list
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };
  
  // Remove feature from list
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  
  // Function to handle image list (not needed anymore, handled by ImageUpload component)
  
  // Create property mutation
  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      const propertyData = {
        ...data,
        features,
        images,
      };
      
      const res = await apiRequest('POST', '/api/properties', propertyData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: translations.property.propertySaved,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      navigate("/panel/properties");
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Update property mutation
  const updateMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      const propertyData = {
        ...data,
        features,
        images,
      };
      
      const res = await apiRequest('PUT', `/api/properties/${params.id}`, propertyData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: translations.property.propertySaved,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${params.id}`] });
      navigate("/panel/properties");
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: PropertyFormValues) => {
    // Make sure we have at least one image
    if (images.length === 0) {
      toast({
        title: "يجب إضافة صورة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };
  
  // Show loading skeleton when fetching data
  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading text-neutral-800 mb-2">
            {isEditing ? translations.property.editProperty : translations.property.addProperty}
          </h1>
          <p className="text-neutral-600">
            {isEditing ? "تعديل بيانات العقار" : "إضافة عقار جديد إلى قائمة العقارات"}
          </p>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold mb-4">المعلومات الأساسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان العقار *</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل عنوان العقار" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="propertyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رمز العقار *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              رمز فريد للعقار (يتم إنشاؤه تلقائيًا)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع العقار *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر نوع العقار" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getPropertyTypes().map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>حالة العقار *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر حالة العقار" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="available">متاح</SelectItem>
                                <SelectItem value="sold">مباع</SelectItem>
                                <SelectItem value="rented">مؤجر</SelectItem>
                                <SelectItem value="pending">قيد التفاوض</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف العقار *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="أدخل وصفاً تفصيلياً للعقار" 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Price Information */}
                  <div className="md:col-span-2">
                    <Separator className="my-6" />
                    <h3 className="text-lg font-bold mb-4">معلومات السعر</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field: { onChange, ...rest } }) => (
                          <FormItem>
                            <FormLabel>السعر *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="أدخل السعر" 
                                {...rest}
                                value={rest.value === null ? "" : rest.value}
                                onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العملة *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر العملة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SAR">ريال سعودي</SelectItem>
                                <SelectItem value="USD">دولار أمريكي</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isRental"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">للإيجار</FormLabel>
                              <FormDescription>
                                حدد إذا كان العقار معروض للإيجار بدلاً من البيع
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("isRental") && (
                        <FormField
                          control={form.control}
                          name="rentalPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>فترة الإيجار</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر فترة الإيجار" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="yearly">سنوي</SelectItem>
                                  <SelectItem value="monthly">شهري</SelectItem>
                                  <SelectItem value="weekly">أسبوعي</SelectItem>
                                  <SelectItem value="daily">يومي</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Location Information */}
                  <div className="md:col-span-2">
                    <Separator className="my-6" />
                    <h3 className="text-lg font-bold mb-4">معلومات الموقع</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المدينة *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCity(value);
                                setSelectedArea("");
                                form.setValue("area", "");
                                form.setValue("neighborhood", "");
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المدينة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getCities().map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المنطقة *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedArea(value);
                                form.setValue("neighborhood", "");
                              }} 
                              defaultValue={field.value}
                              disabled={!selectedCity}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedCity ? "اختر المنطقة" : "اختر المدينة أولاً"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getAreas(selectedCity).map((area) => (
                                  <SelectItem key={area} value={area}>
                                    {area}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الحي *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!selectedArea}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedArea ? "اختر الحي" : "اختر المنطقة أولاً"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getNeighborhoods(selectedCity, selectedArea).map((neighborhood) => (
                                  <SelectItem key={neighborhood} value={neighborhood}>
                                    {neighborhood}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العنوان التفصيلي *</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل العنوان التفصيلي" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Property Details */}
                  <div className="md:col-span-2">
                    <Separator className="my-6" />
                    <h3 className="text-lg font-bold mb-4">تفاصيل العقار</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field: { onChange, ...rest } }) => (
                          <FormItem>
                            <FormLabel>المساحة (م²) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="أدخل المساحة" 
                                {...rest}
                                value={rest.value === null ? "" : rest.value}
                                onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field: { onChange, ...rest } }) => (
                          <FormItem>
                            <FormLabel>عدد غرف النوم</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="أدخل عدد الغرف"
                                {...rest}
                                value={rest.value === null ? "" : rest.value}
                                onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              اترك فارغاً إذا كان غير قابل للتطبيق
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field: { onChange, ...rest } }) => (
                          <FormItem>
                            <FormLabel>عدد الحمامات</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                placeholder="أدخل عدد الحمامات"
                                {...rest}
                                value={rest.value === null ? "" : rest.value}
                                onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              اترك فارغاً إذا كان غير قابل للتطبيق
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="md:col-span-2">
                    <Separator className="my-6" />
                    <h3 className="text-lg font-bold mb-4">المميزات</h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="أضف ميزة للعقار"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={handleAddFeature}>
                          إضافة
                        </Button>
                      </div>
                      
                      {features.length > 0 ? (
                        <div className="border rounded-md p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {features.map((feature, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span>{feature}</span>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleRemoveFeature(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-neutral-500 border border-dashed rounded-md">
                          لم يتم إضافة أي ميزات حتى الآن
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Images */}
                  <div className="md:col-span-2">
                    <Separator className="my-6" />
                    <h3 className="text-lg font-bold mb-4">الصور</h3>
                    <div className="space-y-4">
                      <FormDescription>
                        قم برفع صور العقار مباشرة (الحد الأقصى 8 صور)
                      </FormDescription>
                      
                      <div className="mt-2">
                        <ImageUpload 
                          images={images} 
                          onChange={setImages} 
                          maxImages={8} 
                        />
                      </div>
                      
                      {images.length === 0 && (
                        <div className="text-sm text-red-500 mt-2">
                          يجب إضافة صورة واحدة على الأقل
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/panel/properties")}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جارِ الحفظ...
                      </>
                    ) : (
                      <>حفظ العقار</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
