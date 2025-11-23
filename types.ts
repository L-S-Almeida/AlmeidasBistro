export interface ProductImage {
  url: string;
  zoom: number;
  position: { x: number; y: number };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: ProductImage; // MUDAR de string para ProductImage;
  order: number;
}

export interface StoreSettings {
  name: string;
  isOpen: boolean;
  whatsapp: string;
  bannerMessage: string;
  logoUrl?: string;
  bannerUrl?: string;
  deliveryFee: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewState = 'CUSTOMER' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';
export type PaymentMethod = 'pix' | 'money' | 'credit' | 'debit';