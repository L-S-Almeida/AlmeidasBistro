import React, { useState, useMemo } from 'react';
import { Product, StoreSettings, CartItem } from '../types';
import { ShoppingBag, Plus, Minus, Trash2, X, Send, Search, Store, Utensils, Clock, CreditCard, Banknote, Smartphone, MapPin, FileText, AlertCircle, Lock } from 'lucide-react';

interface CustomerViewProps {
  products: Product[];
  settings: StoreSettings;
  onOpenAdmin: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ products, settings, onOpenAdmin }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [observation, setObservation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix'); // pix, money, credit, debit

  // Validation Modal State
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- Cart Logic ---

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const deliveryFee = Number(settings.deliveryFee || 0);
  const cartTotal = cartSubtotal + deliveryFee;
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- WhatsApp Integration ---

  const handleSendOrder = () => {
  const missingFields = [];
  
  if (!customerName.trim()) missingFields.push("Nome");
  if (!customerPhone.trim()) missingFields.push("WhatsApp");
  if (!address.trim()) missingFields.push("Endereço");
  if (!paymentMethod) missingFields.push("Forma de Pagamento");

  if (missingFields.length > 0) {
    setValidationError(`Por favor, preencha os seguintes campos:\n\n${missingFields.join(', ')}`);
    return;
  }

  // FECHAR o modal ANTES de abrir o WhatsApp
  setIsCartOpen(false);

  // Pequeno delay para garantir que o modal fechou
  setTimeout(() => {
    let message = `*NOVO PEDIDO - ${settings.name}*\n\n`;
    message += `*Cliente:* ${customerName}\n`;
    message += `*WhatsApp:* ${customerPhone}\n`;
    message += `*Endereço:* ${address}\n`;
    
    if (observation) {
        message += `*Observação:* ${observation}\n`;
    }

    message += `\n*-------------------------*\n`;
    message += `*ITENS DO PEDIDO:*\n`;

    cart.forEach(item => {
      message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `*-------------------------*\n`;
    message += `Subtotal: R$ ${cartSubtotal.toFixed(2)}\n`;
    
    if (deliveryFee > 0) {
        message += `Taxa de Entrega: R$ ${deliveryFee.toFixed(2)}\n`;
    } else {
        message += `Taxa de Entrega: A calcular\n`;
    }
    
    message += `*TOTAL: R$ ${cartTotal.toFixed(2)}*\n`;
    message += `*-------------------------*\n`;
    
    const paymentLabel = {
        'pix': 'PIX',
        'money': 'Dinheiro',
        'credit': 'Cartão de Crédito',
        'debit': 'Cartão de Débito'
    }[paymentMethod] || 'Outro';

    message += `*Forma de Pagamento:* ${paymentLabel}\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    // Abrir WhatsApp - isso funciona no mobile
    window.location.href = whatsappUrl;
  }, 300);
};

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-32">
      
      {/* BARRA DE STATUS (Aberto/Fechado) */}
      <div className={`${settings.isOpen ? 'bg-green-500' : 'bg-red-700'} text-white text-center py-2 text-xs font-bold uppercase tracking-wider sticky top-0 z-20 shadow-md`}>
         {settings.isOpen ? (
            <span className="flex items-center justify-center gap-2"><Clock size={14} /> Estamos Abertos! Faça seu pedido.</span>
         ) : (
            <span className="flex items-center justify-center gap-2"><Clock size={14} /> Fechado no momento.</span>
         )}
      </div>

      {/* CABEÇALHO PRINCIPAL */}
      <div className="bg-[#D93F3E] pt-6 pb-10 px-4 shadow-lg mb-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Logo e Nome */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm shadow-inner">
               {settings.logoUrl ? (
                 <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-white" />
               ) : (
                 <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#D93F3E] border-2 border-white">
                   <Store size={28} />
                 </div>
               )}
            </div>
            <div className="text-white">
               <h1 className="text-2xl font-black leading-none mb-1 drop-shadow-md">{settings.name}</h1>
               <div className="flex items-center gap-2">
                 <span className={`w-3 h-3 rounded-full shadow-sm ${settings.isOpen ? 'bg-green-400 border border-white' : 'bg-red-900 border border-white'}`}></span>
                 <span className="text-sm font-medium opacity-90">{settings.isOpen ? 'Aberto Agora' : 'Fechado'}</span>
               </div>
            </div>
          </div>

          {/* Banner de Destaque */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md text-white flex items-center gap-3 shadow-sm">
             <div className="bg-white/20 p-2 rounded-lg">
                <Utensils size={20} className="text-white" />
             </div>
             <span className="font-bold text-sm sm:text-base leading-tight">{settings.bannerMessage || "Seu Pedido Chega Quentinho!"}</span>
          </div>

        </div>
      </div>

      {/* LISTA DE PRODUTOS */}
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100 mx-4">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum item disponível no momento.</p>
            </div>
        ) : (
            <div className="grid gap-4">
            {/* ORDENAR produtos pelo campo 'order' */}
            {products
                .sort((a, b) => a.order - b.order) // ← ADICIONE ESTA LINHA
                .map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start hover:shadow-md transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2">
                
                {/* Foto */}
                <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden relative">
                    <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/eee/999?text=Foto'; }}
                    />
                </div>

                {/* Resto do código permanece igual */}
                <div className="flex-grow min-w-0 flex flex-col justify-between min-h-[6rem]">
                    <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{product.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto">
                    <span className="font-black text-lg text-[#D93F3E]">R$ {Number(product.price).toFixed(2).replace('.', ',')}</span>
                    <button 
                        onClick={() => addToCart(product)}
                        disabled={!settings.isOpen}
                        className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all active:scale-90
                        ${settings.isOpen ? 'bg-gray-900 text-white hover:bg-[#D93F3E]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Plus size={20} />
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* RODAPÉ COM LINK DE ADMIN */}
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400 text-sm mb-2">© {new Date().getFullYear()} {settings.name} - Todos os direitos reservados.</p>
          <button 
            onClick={onOpenAdmin}
            className="text-gray-300 hover:text-[#D93F3E] text-xs flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <Lock size={12} /> Acesso Administrativo
          </button>
      </div>

      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 px-4 animate-in slide-in-from-bottom duration-300">
            <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full max-w-md bg-[#D93F3E] text-white p-3 pl-4 pr-5 rounded-full shadow-2xl flex items-center justify-between font-bold text-lg hover:bg-red-700 transition transform hover:-translate-y-1 ring-4 ring-white/50"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white text-[#D93F3E] w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm relative">
                        <span className="text-lg">{cartItemCount}</span>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-normal opacity-80 uppercase tracking-wide">Total</span>
                        <span className="text-lg">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                </div>
                <span className="flex items-center gap-2 text-sm bg-red-800/30 px-3 py-1.5 rounded-full">
                    Ver Carrinho <ShoppingBag size={16} />
                </span>
            </button>
        </div>
      )}

      {/* MODAL DO CARRINHO (Checkout) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header Modal */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-xl flex items-center gap-2 text-gray-800">
                        <ShoppingBag size={22} className="text-[#D93F3E]" /> Seu Pedido
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-5 space-y-6">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">
                            <ShoppingBag size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Seu carrinho está vazio.</p>
                        </div>
                    ) : (
                        <>
                            {/* Items List */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Itens Selecionados</h3>
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} className="w-full h-full object-cover" alt="" onError={(e) => (e.target as HTMLImageElement).src='https://placehold.co/100'}/>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                            <p className="text-[#D93F3E] font-bold text-sm mt-1">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                            <button onClick={() => item.quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">
                                                {item.quantity === 1 ? <Trash2 size={14}/> : <Minus size={14}/>}
                                            </button>
                                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">
                                                <Plus size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-dashed border-gray-200" />

                            {/* Customer Form */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={14} /> Dados de Entrega
                                </h3>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Seu Nome *"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D93F3E] focus:bg-white focus:ring-2 focus:ring-red-100 transition"
                                    />
                                    <div className="relative">
                                        <Smartphone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input 
                                            type="tel" 
                                            placeholder="Seu WhatsApp (com DDD) *"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D93F3E] focus:bg-white focus:ring-2 focus:ring-red-100 transition"
                                        />
                                    </div>
                                    <textarea 
                                        rows={2}
                                        placeholder="Endereço Completo * (Rua, Número, Bairro, Referência)"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D93F3E] focus:bg-white focus:ring-2 focus:ring-red-100 transition resize-none"
                                    />
                                </div>
                            </div>

                            {/* Observations */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={14} /> Observações
                                </h3>
                                <textarea 
                                    rows={2}
                                    placeholder="Ex: Tirar cebola, caprichar na farofa, troco para 50..."
                                    value={observation}
                                    onChange={(e) => setObservation(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D93F3E] focus:bg-white focus:ring-2 focus:ring-red-100 transition resize-none"
                                />
                            </div>

                            {/* Payment */}
                            <div className="space-y-3 pb-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Forma de Pagamento *</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setPaymentMethod('credit')}
                                        className={`p-3 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition
                                            ${paymentMethod === 'credit' 
                                                ? 'bg-red-50 border-[#D93F3E] text-[#D93F3E] ring-1 ring-[#D93F3E]' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <CreditCard size={18} /> Crédito
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('debit')}
                                        className={`p-3 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition
                                            ${paymentMethod === 'debit' 
                                                ? 'bg-red-50 border-[#D93F3E] text-[#D93F3E] ring-1 ring-[#D93F3E]' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <CreditCard size={18} /> Débito
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('pix')}
                                        className={`p-3 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition
                                            ${paymentMethod === 'pix' 
                                                ? 'bg-red-50 border-[#D93F3E] text-[#D93F3E] ring-1 ring-[#D93F3E]' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Store size={18} /> PIX
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('money')}
                                        className={`p-3 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition
                                            ${paymentMethod === 'money' 
                                                ? 'bg-red-50 border-[#D93F3E] text-[#D93F3E] ring-1 ring-[#D93F3E]' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Banknote size={18} /> Dinheiro
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-10">
                        <div className="space-y-1 mb-4 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>R$ {cartSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Taxa de Entrega</span>
                                <span>{deliveryFee === 0 ? 'A calcular' : `R$ ${deliveryFee.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between font-black text-xl text-gray-800 pt-2 border-t border-dashed border-gray-200 mt-2">
                                <span>Total</span>
                                <span>R$ {cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleSendOrder}
                            disabled={!settings.isOpen}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-xl shadow-green-200 flex items-center justify-center gap-2 text-lg
                                ${settings.isOpen ? 'bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            {settings.isOpen ? <><Send size={20} /> Enviar Pedido</> : 'Loja Fechada'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Validation Error Modal */}
      {validationError && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full text-[#D93F3E]">
                        <AlertCircle size={40} />
                    </div>
                </div>
                <h3 className="text-center font-bold text-xl mb-2 text-gray-800">Atenção</h3>
                <p className="text-center text-gray-600 mb-6 whitespace-pre-line text-sm leading-relaxed">{validationError}</p>
                <button 
                    onClick={() => setValidationError(null)}
                    className="w-full bg-[#D93F3E] text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                >
                    Entendi, vou preencher
                </button>
            </div>
        </div>
      )}
    </div>
  );
};