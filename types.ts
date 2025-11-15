export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category?: string;
}

export interface StoreSettings {
  name: string;
  whatsapp: string;
  isOpen: boolean;
  logoUrl: string;
  bannerUrl: string; // For the "Seu pedido chega quentinho" section
  bannerMessage: string;
  deliveryFee: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewState = 'CUSTOMER' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';