import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertContactMessageSchema } from "@shared/schema";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import translations from "@/lib/i18n";

// Extend the validation schema
const formSchema = insertContactMessageSchema.extend({
  name: z.string().min(3, "الاسم يجب أن يحتوي على الأقل 3 أحرف"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional(),
  subject: z.string().min(1, "يرجى اختيار الموضوع"),
  message: z.string().min(10, "الرسالة يجب أن تحتوي على الأقل 10 أحرف"),
});

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الرسالة",
        description: "سنقوم بالرد عليك في أقرب وقت ممكن",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    mutation.mutate(values);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700">
                  {translations.contact.name} *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="أدخل اسمك الكامل" 
                    {...field} 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-700">
                  {translations.contact.email} *
                </FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="example@example.com" 
                    {...field} 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700">
                {translations.contact.phone}
              </FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="05xxxxxxxx" 
                  value={field.value || ""} 
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700">
                {translations.contact.subject} *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموضوع" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buy">شراء عقار</SelectItem>
                  <SelectItem value="sell">بيع عقار</SelectItem>
                  <SelectItem value="rent">تأجير عقار</SelectItem>
                  <SelectItem value="evaluation">تقييم عقار</SelectItem>
                  <SelectItem value="consult">استشارة عقارية</SelectItem>
                  <SelectItem value="other">موضوع آخر</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700">
                {translations.contact.message} *
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="أدخل رسالتك هنا" 
                  rows={5} 
                  {...field} 
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <i className="fas fa-circle-notch fa-spin ml-2"></i>
            ) : (
              <i className="fas fa-paper-plane ml-2"></i>
            )}
            {translations.contact.sendMessage}
          </Button>
          
          <a 
            href="https://wa.me/966551499084" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-colors"
          >
            <i className="fab fa-whatsapp text-xl"></i>
            <span>تواصل عبر واتساب</span>
          </a>
        </div>
      </form>
    </Form>
  );
}
