export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isPublished: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  email: string;
  phone: string;
  note: string;
  status: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  slogan: string;
  supportEmail: string;
  supportPhone: string;
  themeColor: string;
}

export interface CurrentUser {
  subject: string;
  name: string;
  isAdmin: boolean;
}

export interface DashboardStats {
  products: number;
  articles: number;
  banners: number;
  orders: number;
  contacts: number;
}
