import { z } from "zod";

// Property type
export interface Property {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  type: string;
  price: number;
  currency: string;
  isRental: boolean;
  rentalPeriod?: string;
  city: string;
  area?: string;
  neighborhood: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  size: number;
  features?: string[];
  images: string[];
  status: string;
  createdAt: Date;
  propertyCode: string;
  latitude?: number;
  longitude?: number;
}

// User type
export interface User {
  _id?: string;
  id?: number;
  username: string;
  password: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

// Contact Message type
export interface ContactMessage {
  _id?: string;
  id?: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

// Testimonial type
export interface Testimonial {
  _id?: string;
  id?: number;
  name: string;
  location: string;
  message: string;
  rating: number;
  createdAt: Date;
  isApproved: boolean;
}

// Insert schemas using Zod
export const insertPropertySchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  type: z.string().min(1, "نوع العقار مطلوب"),
  price: z.number().min(0, "السعر يجب أن يكون رقم موجب"),
  currency: z.string().default("SAR"),
  isRental: z.boolean().default(false),
  rentalPeriod: z.string().optional(),
  city: z.string().min(1, "المدينة مطلوبة"),
  area: z.string().optional(),
  neighborhood: z.string().min(1, "الحي مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  size: z.number().min(0, "المساحة مطلوبة"),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1, "صورة واحدة على الأقل مطلوبة"),
  status: z.string().default("available"),
  propertyCode: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const insertUserSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  name: z.string().min(1, "الاسم مطلوب"),
  role: z.string().default("user"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional(),
});

export const insertContactMessageSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional(),
  subject: z.string().min(1, "الموضوع مطلوب"),
  message: z.string().min(1, "الرسالة مطلوبة"),
});

export const insertTestimonialSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  location: z.string().min(1, "الموقع مطلوب"),
  message: z.string().min(1, "الرسالة مطلوبة"),
  rating: z.number().min(1).max(5),
});

// Types
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

// Search schema with enhanced features
export const propertySearchSchema = z.object({
  city: z.string().optional(),
  area: z.string().optional(),
  neighborhood: z.string().optional(),
  type: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
  bedrooms: z.number().optional(),
  isRental: z.boolean().optional(),
});

export type PropertySearch = z.infer<typeof propertySearchSchema>;

// City structure with areas and neighborhoods for cascading search
export const cityStructure: Record<string, Record<string, string[]>> = {
  "الرياض": {
    "شمال الرياض": ["الملقا", "العليا", "النرجس", "الياسمين", "الصحافة", "الغدير", "الندى", "المحمدية", "الربوة"],
    "جنوب الرياض": ["الملز", "السليمانية", "العقيق", "الدار البيضاء", "النسيم الشرقي", "الفيصلية", "المنار"],
    "شرق الرياض": ["الورود", "الريان", "المروج", "الروضة", "النخيل", "اليرموك", "بدر"],
    "غرب الرياض": ["النسيم", "الشفا", "المنصورة", "السويدي", "الخليج", "عرقة", "الدرعية"],
  },
  "جدة": {
    "شمال جدة": ["الشاطئ", "الروضة", "الزهراء", "أبحر", "النعيم", "الفيحاء", "الصفا", "المرجان"],
    "جنوب جدة": ["البوادي", "الحمراء", "السلامة", "الثغر", "الرحاب", "النزهة", "الصالحية"],
    "وسط جدة": ["الصفا", "البلد", "الكورنيش", "الأمير فواز", "المحمدية", "الكندرة", "الهنداوية"],
  },
  "الدمام": {
    "الدمام الشمالية": ["الفيصلية", "الشاطئ الشرقي", "الفردوس", "الفنار", "النور", "الخالدية"],
    "الدمام الغربية": ["الشاطئ الغربي", "الزهور", "الأمانة", "الجلوية", "الروضة", "الأثير"],
    "الدمام الجنوبية": ["المريكبات", "الضباب", "الفرسان", "الندى", "الخليج"],
  },
  "الخبر": {
    "شمال الخبر": ["اليرموك", "الكورنيش", "العقربية", "الراكة", "العزيزية"],
    "جنوب الخبر": ["العزيزية", "الثقبة", "الهدا", "الخزامى", "الحزام الذهبي"],
  },
  "مكة المكرمة": {
    "وسط مكة": ["العزيزية", "الشوقية", "العتيبية", "جرول", "الحجون", "المسفلة"],
    "شمال مكة": ["الكعكية", "الهجرة", "النوارية", "التنعيم", "الزاهر", "العوالي"],
    "جنوب مكة": ["الشرائع", "المعابدة", "الحج", "النسيم", "الرصيفة"],
  },
  "المدينة المنورة": {
    "وسط المدينة": ["المنطقة المركزية", "العيون", "قباء", "العصبة", "باب المجيدي"],
    "شمال المدينة": ["العوالي", "السيح", "الحرة الشرقية", "الجمعة", "المبعوث", "أبيار علي"],
    "جنوب المدينة": ["قربان", "الخالدية", "العزيزية", "الفتح"],
  },
  "الطائف": {
    "وسط الطائف": ["الفيصلية", "العزيزية", "السلامة", "المثناة"],
    "شمال الطائف": ["الشفا", "الحوية", "الربوة", "النزهة", "الوسام"],
    "شرق الطائف": ["السداد", "النسيم", "الخالدية", "الريان"],
  },
  "أبها": {
    "وسط أبها": ["المنسك", "المروج", "الموظفين الشمالي", "الواديين"],
    "شمال أبها": ["الموظفين", "الضباب", "السامر", "الخشع"],
    "شرق أبها": ["الورود", "النسيم", "البديع", "النخيل"],
  },
  "تبوك": {
    "وسط تبوك": ["الفيصلية", "السليمانية", "المروج"],
    "شمال تبوك": ["الورود", "النسيم", "الأمير فهد"],
    "جنوب تبوك": ["الخالدية", "الروضة", "الصناعية"],
  },
  "بريدة": {
    "وسط بريدة": ["الإسكان", "الفايزية", "المنتزه"],
    "شمال بريدة": ["الخبيب", "الصفراء", "النقع"],
    "شرق بريدة": ["الروضة", "المعيقلية", "الضاحية"],
  },
};
