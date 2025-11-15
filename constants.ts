import { Product, StoreSettings } from './types';

export const DEFAULT_SETTINGS: StoreSettings = {
  name: "Almeidas Bistrô",
  whatsapp: "5598991414917",
  isOpen: true,
  logoUrl: "", // Empty by default
  bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
  bannerMessage: "Seu Pedido Chega Quentinho!",
  deliveryFee: 0 // 0 means "To be calculated" or Free
};

export const INITIAL_MENU: Product[] = [
  { id: "1", name: "Mocotó 700ml - Completo", price: 40.00, description: "Arroz, farofa e pirão (serve até 2 pessoas).", image: "https://images.unsplash.com/photo-1593560708920-61dd98c46f06?q=80&w=1000&auto=format&fit=crop" },
  { id: "2", name: "Mocotó 700ml - Simples", price: 30.00, description: "Sem acompanhamentos.", image: "https://images.unsplash.com/photo-1617450379011-fec8923a100a?q=80&w=1000&auto=format&fit=crop" },
  { id: "3", name: "Mocotó 500ml - Completo", price: 30.00, description: "Arroz, farofa e pirão.", image: "https://images.unsplash.com/photo-1579737194129-c062c3e1e23f?q=80&w=1000&auto=format&fit=crop" },
  { id: "4", name: "Mocotó 500ml - Simples", price: 25.00, description: "Sem acompanhamentos.", image: "https://images.unsplash.com/photo-1617450379011-fec8923a100a?q=80&w=1000&auto=format&fit=crop" },
  { id: "5", name: "Feijoada 700ml - Completa", price: 35.00, description: "Arroz, farofa e couve com laranja (serve até 2 pessoas).", image: "https://images.unsplash.com/photo-1594007654729-407edc01796c?q=80&w=1000&auto=format&fit=crop" },
  { id: "6", name: "Feijoada 700ml - Simples", price: 25.00, description: "Sem acompanhamentos.", image: "https://images.unsplash.com/photo-1617450379011-fec8923a100a?q=80&w=1000&auto=format&fit=crop" },
  { id: "7", name: "Feijoada 500ml - Completa", price: 25.00, description: "Arroz, farofa e couve com laranja.", image: "https://images.unsplash.com/photo-1604382164759-011883a25f52?q=80&w=1000&auto=format&fit=crop" },
  { id: "8", name: "Feijoada 500ml - Simples", price: 20.00, description: "Sem acompanhamentos.", image: "https://images.unsplash.com/photo-1617450379011-fec8923a100a?q=80&w=1000&auto=format&fit=crop" },
  { id: "9", name: "Adicional - Arroz", price: 8.00, description: "500ml de arroz soltinho e gostoso.", image: "https://images.unsplash.com/photo-1617450379011-fec8923a100a?q=80&w=1000&auto=format&fit=crop" },
  { id: "10", name: "Adicional - Pirão", price: 5.00, description: "300ml de pirão delicioso.", image: "https://images.unsplash.com/photo-1617450379011-fec8923a100a?q=80&w=1000&auto=format&fit=crop" },
  { id: "11", name: "Adicional - Farofa", price: 3.00, description: "100g daquela farofa crocante que cai bem com tudo.", image: "https://images.unsplash.com/photo-1617450379011-fec8923a100a?q=80&w=1000&auto=format&fit=crop" },
];