import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cityStructure } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "SAR"): string {
  return `${amount.toLocaleString('ar-SA')} ${currency === 'SAR' ? 'ريال' : currency}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getPropertyStatusBadgeColor(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'sold':
      return 'bg-red-100 text-red-800';
    case 'rented':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getPropertyTypeIcon(type: string): string {
  switch (type) {
    case 'villa':
      return 'fas fa-home';
    case 'apartment':
      return 'fas fa-building';
    case 'land':
      return 'fas fa-map';
    case 'commercial':
      return 'fas fa-store';
    default:
      return 'fas fa-landmark';
  }
}

export function createPropertyCode(): string {
  return `SA-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function getCities(): string[] {
  return [
    'الرياض', 
    'جدة', 
    'مكة المكرمة', 
    'المدينة المنورة', 
    'الدمام', 
    'الخبر', 
    'تبوك', 
    'أبها', 
    'نجران', 
    'جازان', 
    'حائل', 
    'الطائف',
    'بريدة',
    'عنيزة',
    'القطيف',
    'القصيم'
  ];
}

export function getPropertyTypes(): { value: string, label: string }[] {
  return [
    { value: 'villa', label: 'فيلا' },
    { value: 'apartment', label: 'شقة' },
    { value: 'land', label: 'أرض' },
    { value: 'commercial', label: 'تجاري' },
    { value: 'building', label: 'عمارة' },
    { value: 'restHouse', label: 'استراحة' }
  ];
}

export function getPriceRanges(): { value: string, label: string }[] {
  return [
    { value: 'all', label: 'جميع الأسعار' },
    { value: '0-500000', label: 'أقل من 500,000 ريال' },
    { value: '500000-1000000', label: 'من 500,000 إلى 1,000,000 ريال' },
    { value: '1000000-2000000', label: 'من 1,000,000 إلى 2,000,000 ريال' },
    { value: '2000000+', label: 'أكثر من 2,000,000 ريال' }
  ];
}

export function isRtl(): boolean {
  return document.documentElement.dir === 'rtl';
}

export function getAreas(city: string): string[] {
  if (!city || !cityStructure[city]) return [];
  return Object.keys(cityStructure[city]);
}

export function getNeighborhoods(city: string, area: string): string[] {
  if (!city || !area || !cityStructure[city] || !cityStructure[city][area]) return [];
  return cityStructure[city][area];
}
