import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  Tags,
  Layers,
  Boxes,
  Warehouse,
  BadgePercent,
  Truck,
  CreditCard,
  Wallet,
  ShieldCheck,
  Award,
  LifeBuoy,
  MessageSquare,
  Wrench,
  FileText,
  Newspaper,
  MapPin,
  Search,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** عنوان بخش سایدبار؛ آیتم‌های هم‌بخش زیر یک تیتر جمع می‌شوند */
  section: string;
};

/**
 * آیتم‌های منوی کنار (سایدبار).
 * برای اضافه کردن صفحه جدید یک آیتم اینجا اضافه کنید و
 * یک فولدر هم‌نام با href داخل src/app/(dashboard)/ بسازید.
 */
export const navItems: NavItem[] = [
  { title: "داشبورد", href: "/", icon: LayoutDashboard, section: "اصلی" },

  { title: "سفارش‌ها", href: "/orders", icon: ShoppingCart, section: "فروش" },
  { title: "پرداخت‌ها", href: "/payments", icon: CreditCard, section: "فروش" },
  { title: "روش‌های پرداخت", href: "/payment-methods", icon: Wallet, section: "فروش" },
  { title: "کدهای تخفیف", href: "/discounts", icon: BadgePercent, section: "فروش" },
  { title: "روش‌های ارسال", href: "/shipping", icon: Truck, section: "فروش" },

  { title: "محصولات", href: "/products", icon: Package, section: "کاتالوگ" },
  { title: "دسته‌بندی‌ها", href: "/categories", icon: Layers, section: "کاتالوگ" },
  { title: "برندها", href: "/brands", icon: Tags, section: "کاتالوگ" },
  { title: "پکیج‌ها", href: "/bundles", icon: Boxes, section: "کاتالوگ" },
  { title: "انبار", href: "/inventory", icon: Warehouse, section: "کاتالوگ" },

  { title: "کاربران", href: "/users", icon: Users, section: "مشتریان" },
  { title: "نقش‌ها و دسترسی", href: "/roles", icon: ShieldCheck, section: "مشتریان" },
  { title: "باشگاه مشتریان", href: "/loyalty", icon: Award, section: "مشتریان" },

  { title: "تیکت‌ها", href: "/tickets", icon: LifeBuoy, section: "پشتیبانی" },
  { title: "نظرات", href: "/comments", icon: MessageSquare, section: "پشتیبانی" },
  { title: "تعمیرات", href: "/repairs", icon: Wrench, section: "پشتیبانی" },
  { title: "گارانتی‌ها", href: "/warranties", icon: FileText, section: "پشتیبانی" },

  { title: "مقالات", href: "/articles", icon: Newspaper, section: "محتوا" },
  { title: "شعب", href: "/branches", icon: MapPin, section: "محتوا" },
  { title: "سئو", href: "/seo", icon: Search, section: "محتوا" },

  { title: "گزارش‌ها", href: "/reports", icon: BarChart3, section: "سیستم" },
  { title: "تنظیمات", href: "/settings", icon: Settings, section: "سیستم" },
];
