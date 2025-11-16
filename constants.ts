import { Product, StoreSettings } from './types';

export const DEFAULT_SETTINGS: StoreSettings = {
  name: "", // ← VAZIO - admin preenche
  whatsapp: "", // ← VAZIO - admin preenche  
  isOpen: false, // ← Começa fechado por segurança
  logoUrl: "",
  bannerUrl: "",
  bannerMessage: "", // ← VAZIO
  deliveryFee: 0
};

// Lista VAZIA - admin adiciona produtos
export const INITIAL_MENU: Product[] = [];