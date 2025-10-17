import { useEffect } from "react";

// Add Arabic language support
document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";

// This is a minimal implementation for language support
// In a real app, you would use a library like i18next

export const translations = {
  common: {
    search: "بحث",
    viewDetails: "عرض التفاصيل",
    contact: "اتصل بنا",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    dashboard: "لوحة التحكم",
    home: "الرئيسية",
    properties: "العقارات",
    services: "خدماتنا",
    about: "من نحن",
    contactUs: "اتصل بنا",
    loading: "جار التحميل...",
    error: "حدث خطأ",
    noResults: "لا توجد نتائج",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    submit: "إرسال",
    required: "مطلوب",
    all: "الكل",
    featured: "مميز",
    price: "السعر",
    area: "المساحة",
    bedrooms: "غرف النوم",
    bathrooms: "الحمامات",
    location: "الموقع",
    type: "النوع",
    status: "الحالة",
  },
  property: {
    types: {
      villa: "فيلا",
      apartment: "شقة",
      land: "أرض",
      commercial: "تجاري",
    },
    statuses: {
      available: "متاح",
      sold: "مباع",
      rented: "مؤجر",
      pending: "قيد التفاوض",
    },
    forSale: "للبيع",
    forRent: "للإيجار",
    addProperty: "إضافة عقار",
    editProperty: "تعديل العقار",
    deleteProperty: "حذف العقار",
    areYouSure: "هل أنت متأكد من حذف هذا العقار؟",
    propertyDeleted: "تم حذف العقار بنجاح",
    propertySaved: "تم حفظ العقار بنجاح",
    yearlyRent: "سنوياً",
    propertyDetails: "تفاصيل العقار",
    features: "المميزات",
    code: "رمز العقار",
  },
  contact: {
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    subject: "الموضوع",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    messageSent: "تم إرسال رسالتك بنجاح",
  },
  admin: {
    dashboard: "لوحة التحكم",
    manageProperties: "إدارة العقارات",
    manageUsers: "إدارة المستخدمين",
    messages: "الرسائل",
    settings: "الإعدادات",
    welcomeBack: "مرحباً بعودتك",
    totalProperties: "إجمالي العقارات",
    totalMessages: "إجمالي الرسائل",
    recentProperties: "أحدث العقارات",
    recentMessages: "أحدث الرسائل",
  },
  auth: {
    username: "اسم المستخدم",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginFailed: "اسم المستخدم أو كلمة المرور غير صحيحة",
    logoutSuccess: "تم تسجيل الخروج بنجاح",
    adminAccess: "الدخول إلى لوحة التحكم",
  },
  search: {
    city: "المدينة",
    allCities: "جميع المدن",
    propertyType: "نوع العقار",
    allTypes: "جميع الأنواع",
    priceRange: "نطاق السعر",
    allPrices: "جميع الأسعار",
    lessThan: "أقل من",
    between: "بين",
    moreThan: "أكثر من",
    searchNow: "بحث",
    advancedSearch: "بحث متقدم",
    sortBy: "ترتيب حسب",
    newest: "الأحدث",
    priceHighToLow: "السعر: من الأعلى إلى الأقل",
    priceLowToHigh: "السعر: من الأقل إلى الأعلى",
    areaHighToLow: "المساحة: من الأكبر إلى الأصغر",
  }
};

export function useArabicPlaceholders() {
  useEffect(() => {
    // Ensure input placeholder text alignment is correct in RTL mode
    const style = document.createElement('style');
    style.textContent = `
      input::placeholder, textarea::placeholder {
        text-align: right;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

export default translations;
