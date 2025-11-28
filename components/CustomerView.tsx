import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, X, Send, Search, Store, Utensils, Clock, CreditCard, Banknote, Smartphone, MapPin, FileText, AlertCircle, Lock, Maximize2, Menu } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  order: number;
}

interface StoreSettings {
  name: string;
  whatsapp: string;
  deliveryFee: number;
  isOpen: boolean;
  logoUrl: string;
  bannerMessage: string;
}

interface CartItem extends Product {
  quantity: number;
}
// ------------------------------------------

// O componente CustomerView principal
export const CustomerView: React.FC<{ products: Product[]; settings: StoreSettings; onOpenAdmin: () => void; }> = ({ products, settings, onOpenAdmin }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // NOVO: Estado para quantidade na lista (Seletor Temporário) - Variável renomeada conforme solicitado
  const [listQuantities, setListQuantities] = useState<{[key: string]: number}>({});

  // Estado para modal de imagem em tela cheia
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [observation, setObservation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');

  // Validation Modal State
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- Cart Logic Centralizada ---

  // FUNÇÃO: Atualiza quantidade na lista de produtos (seletor de quantidade temporário)
  const updateListQuantity = (productId: string, delta: number) => {
    // Só permite alteração se a loja estiver aberta
    if (!settings.isOpen) {
        setValidationError("Desculpe, a loja está fechada e não é possível modificar o pedido.");
        return;
    }
    
    // Atualiza a quantidade no estado local (listQuantities)
    setListQuantities(prev => {
      const current = prev[productId] || 0;
      const newQuantity = Math.max(0, current + delta);
      
      // Remove o produto da lista de quantidades se chegar a zero
      if (newQuantity === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [productId]: newQuantity };
    });
  };
  
  // FUNÇÃO CRUCIAL: Move todos os itens selecionados da lista para o carrinho
  // ESTA É UMA NOVA FUNÇÃO para isolar a lógica de transferência.
  const mergeListToCart = () => {
    setCart(prevCart => {
      let newCart = [...prevCart];

      Object.entries(listQuantities).forEach(([productId, quantity]) => {
        if (quantity > 0) {
          const product = products.find(p => p.id === productId);
          if (!product) return;

          const existingIndex = newCart.findIndex(item => item.id === productId);

          if (existingIndex >= 0) {
            // Se já existe, adiciona a quantidade selecionada
            newCart = newCart.map((item, index) => 
              index === existingIndex 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Se não existe, adiciona novo item
            newCart.push({ ...product, quantity });
          }
        }
      });
      return newCart;
    });

    // Limpa a seleção temporária da lista após a fusão
    setListQuantities({});
  };

  // FUNÇÃO: Ao clicar em "Ver Carrinho", move os itens e abre o modal
  // Esta função é nova e centraliza o fluxo de abertura.
  const handleOpenCart = () => {
    // Primeiro, funde a seleção da lista com o carrinho
    mergeListToCart();
    // Depois, abre o modal
    setIsCartOpen(true);
  };
  
  // FUNÇÃO: Ao fechar o carrinho, garante que a lista de seleção temporária esteja vazia (embora já deva estar)
  const handleCloseCart = () => {
    setIsCartOpen(false);
    // Embora a fusão esvazie listQuantities, esta linha garante a limpeza ao fechar o modal, caso o fluxo seja interrompido.
    setListQuantities({}); 
  };


  // FUNÇÃO: Atualizar quantidade no carrinho (dentro do modal)
  const updateQuantityInCart = (id: string, delta: number) => {
    if (!settings.isOpen) {
        setValidationError("Desculpe, a loja está fechada e não é possível modificar o pedido.");
        return;
    }

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        if (newQuantity === 0) {
          return null; // Marca para remover
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]); // Remove itens null
  };
  
  // FUNÇÃO DE REMOÇÃO SIMPLES - Mantida
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // --- CÁLCULOS COMBINADOS PARA O BOTÃO FLUTUANTE ---
  
  // 1. Subtotal de Itens Confirmados no Carrinho (Cart) - SEM ALTERAÇÕES
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // NOVO: 2. Subtotal de Itens Selecionados na Lista (List Quantities)
  const listSubtotal = useMemo(() => {
    return Object.entries(listQuantities).reduce((total, [id, quantity]) => {
      const product = products.find(p => p.id === id);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  }, [listQuantities, products]);

  // 3. Subtotal Total Combinado (Usado no botão flutuante)
  const combinedSubtotal = cartSubtotal + listSubtotal; // MODIFICADO PARA SOMAR OS DOIS

  const deliveryFee = Number(settings.deliveryFee || 0);
  // 4. Total Combinado (Usado no botão flutuante)
  const combinedTotal = combinedSubtotal + deliveryFee;
  
  // 5. Contagem Total de Itens (Usado no botão flutuante)
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  // NOVO: Contagem de itens temporários
  const totalQuantitiesInList = useMemo(() => {
    return Object.values(listQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [listQuantities]);
  const combinedItemCount = cartItemCount + totalQuantitiesInList; // MODIFICADO PARA SOMAR OS DOIS


  // Mostrar botão flutuante se houver itens no carrinho OU quantidades selecionadas na lista
  const shouldShowCartButton = combinedItemCount > 0;
  
  // Função para enviar o pedido (mantida, mas verifica que o cart está atualizado)
  const handleSendOrder = () => {
    if (!settings.isOpen) {
        setValidationError("O pedido não pode ser enviado. A loja está fechada.");
        return;
    }
    
    // NOTA: A fusão (mergeListToCart) já foi garantida na abertura do modal, 
    // então o 'cart' já está com todos os itens do pedido.

    const missingFields = [];
    
    const finalCartItems = cart; // Usa o estado 'cart' atualizado
    const finalCartSubtotal = finalCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const finalCartTotal = finalCartSubtotal + deliveryFee;

    if (!customerName.trim()) missingFields.push("Nome");
    if (!customerPhone.trim()) missingFields.push("WhatsApp");
    if (!address.trim()) missingFields.push("Endereço");
    if (!paymentMethod) missingFields.push("Forma de Pagamento");

    if (missingFields.length > 0) {
      setValidationError(`Por favor, preencha os seguintes campos:\n\n${missingFields.join(', ')}`);
      return;
    }

    // Fecha e limpa o carrinho
    setIsCartOpen(false);
    setCart([]); 
    
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

      finalCartItems.forEach(item => {
        message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
      });

      message += `*-------------------------*\n`;
      message += `Subtotal: R$ ${finalCartSubtotal.toFixed(2).replace('.', ',')}\n`;
      
      if (deliveryFee > 0) {
          message += `Taxa de Entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
      } else {
          message += `Taxa de Entrega: A calcular\n`;
      }
      
      message += `*TOTAL: R$ ${finalCartTotal.toFixed(2).replace('.', ',')}*\n`;
      message += `*-------------------------*\n`;
      
      const paymentLabel = {
          'pix': 'PIX',
          'money': 'Dinheiro',
          'credit': 'Cartão de Crédito',
          'debit': 'Cartão de Débito'
      }[paymentMethod] || 'Outro';

      message += `*Forma de Pagamento:* ${paymentLabel}\n`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = settings.whatsapp.replace(/\D/g, ''); 
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
    }, 300);
  };
  
  // Funções utilitárias (mantidas)
  const getProductInitials = (productName: string): string => {
    const words = productName.split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  const getProductColor = (productName: string): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = productName.length % colors.length;
    return colors[index];
  };

  const isValidImage = (url: string): boolean => {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    if (url.startsWith('http')) return true;
    return false;
  };

  const handleImageClick = (imageUrl: string) => {
    if (isValidImage(imageUrl)) {
      setSelectedImage(imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-32">
      
      {/* BARRA DE STATUS (Aberto/Fechado) */}
      <div className={`${settings.isOpen ? 'bg-green-600' : 'bg-red-700'} text-white text-center py-2 text-xs font-bold uppercase tracking-wider sticky top-0 z-20 shadow-md`}>
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
                 <img 
                   src={settings.logoUrl} 
                   alt="Logo" 
                   className="w-16 h-16 rounded-full object-cover border-2 border-white" 
                   onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      target.src = ''; 
                      target.onerror = null;
                   }}
                 />
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

      {/* LISTA DE PRODUTOS - AGORA COM SELETOR DE QUANTIDADE DIRETO */}
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100 mx-4">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum item disponível no momento.</p>
            </div>
        ) : (
            <div className="grid gap-4">
            {products
                .sort((a, b) => a.order - b.order)
                .map(product => {
                  const quantity = listQuantities[product.id] || 0;
                  const isInCart = cart.some(item => item.id === product.id);
                  
                  return (
                    <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start hover:shadow-md transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2">
                    
                    {/* Foto - Clicável */}
                    <div 
                      className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden relative cursor-pointer"
                      onClick={() => handleImageClick(product.image)}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Fallback */}
                      <div 
                        className={`absolute inset-0 flex items-center justify-center ${getProductColor(product.name)} text-white font-bold text-lg rounded-xl`}
                        style={{ display: isValidImage(product.image) ? 'none' : 'flex' }}
                      >
                        {getProductInitials(product.name)}
                      </div>
                      {/* ÍCONE DE AMPLIAR */}
                      <div className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={12} />
                      </div>
                    </div>

                    <div className="flex-grow min-w-0 flex flex-col justify-between min-h-[6rem]">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{product.name}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <span className="font-black text-lg text-[#D93F3E]">R$ {Number(product.price).toFixed(2).replace('.', ',')}</span>
                        
                        {/* SELETOR DE QUANTIDADE E BOTÃO DE ADICIONAR AO CARRINHO (QUE AGORA ABRE O MODAL) */}
                        <div className="flex items-center gap-2">
                          
                          {/* 1. SELETOR DE QUANTIDADE NA LISTA (listQuantities) */}
                          <div className={`flex items-center rounded-lg p-1 transition-all ${quantity > 0 ? 'bg-gray-100' : 'bg-transparent'}`}>
                            {quantity > 0 && (
                              <button 
                                onClick={() => updateListQuantity(product.id, -1)}
                                disabled={!settings.isOpen}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition disabled:opacity-50"
                              >
                                {quantity === 1 ? <Trash2 size={14}/> : <Minus size={14}/>}
                              </button>
                            )}
                            {quantity > 0 && (
                              <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                            )}
                            {/* Botão de + (Sempre visível se já houver item no carrinho ou se for o seletor principal) */}
                            {quantity > 0 && (
                              <button 
                                onClick={() => updateListQuantity(product.id, 1)}
                                disabled={!settings.isOpen}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition disabled:opacity-50"
                              >
                                <Plus size={14}/>
                              </button>
                            )}
                          </div>
                          
                          {/* 2. BOTÃO PRINCIPAL: Abre o modal do carrinho ou inicia a seleção */}
                          <button 
                            onClick={() => {
                                // Se já tiver itens no carrinho ou selecionado na lista, abre o modal
                                if (quantity > 0 || isInCart) {
                                    handleOpenCart();
                                } else {
                                    // Se não tiver nada, inicia com 1 na lista (primeiro toque)
                                    updateListQuantity(product.id, 1);
                                }
                            }}
                            disabled={!settings.isOpen}
                            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all active:scale-90
                              ${settings.isOpen 
                                ? (quantity > 0 || isInCart)
                                  ? 'bg-blue-500 text-white hover:bg-blue-700' // Abre o carrinho
                                  : 'bg-[#D93F3E] text-white hover:bg-red-700' // Inicia seleção
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                          >
                            {(quantity > 0 || isInCart) ? <ShoppingBag size={18} /> : <Plus size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
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
            {/*<Lock size={12} /> Acesso Administrativo*/}
          </button>
      </div>

      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      {shouldShowCartButton && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 px-4 animate-in slide-in-from-bottom duration-300">
            <button 
                onClick={handleOpenCart} // MODIFICADO: Chama a função que funde os itens antes de abrir
                className="w-full max-w-md bg-[#D93F3E] text-white p-3 pl-4 pr-5 rounded-full shadow-2xl flex items-center justify-between font-bold text-lg hover:bg-red-700 transition transform hover:-translate-y-1 ring-4 ring-white/50"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white text-[#D93F3E] w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm relative">
                        <span className="text-lg">{combinedItemCount}</span>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-normal opacity-80 uppercase tracking-wide">Total</span>
                        <span className="text-lg">R$ {combinedTotal.toFixed(2).replace('.', ',')}</span>
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
                    <button onClick={handleCloseCart} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-5 space-y-6">
                    {/* Aqui usamos o cart.length (que já foi preenchido pela função mergeListToCart em handleOpenCart) */}
                    {cart.length === 0 ? ( 
                        <div className="text-center text-gray-400 mt-20">
                            <ShoppingBag size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Seu carrinho está vazio.</p>
                            <button
                                onClick={handleCloseCart}
                                className="mt-4 text-sm text-[#D93F3E] font-semibold hover:underline"
                            >
                                Voltar para o Cardápio
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Items List - No modal, usa updateQuantityInCart */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Itens Selecionados</h3>
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                            <img 
                                              src={item.image} 
                                              className="w-full h-full object-cover" 
                                              alt={item.name}
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                              }}
                                            />
                                            {/* Fallback */}
                                            <div 
                                              className={`w-full h-full flex items-center justify-center ${getProductColor(item.name)} text-white font-bold text-sm`}
                                              style={{ display: isValidImage(item.image) ? 'none' : 'flex' }}
                                            >
                                              {getProductInitials(item.name)}
                                            </div>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                            <p className="text-[#D93F3E] font-bold text-sm mt-1">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                                        </div>
                                        {/* Botoes no Modal */}
                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                            <button 
                                              onClick={() => updateQuantityInCart(item.id, -1)} 
                                              disabled={!settings.isOpen}
                                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition disabled:opacity-50"
                                            >
                                                {item.quantity === 1 ? <Trash2 size={14}/> : <Minus size={14}/>}
                                            </button>
                                            <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                            <button 
                                              onClick={() => updateQuantityInCart(item.id, 1)} 
                                              disabled={!settings.isOpen}
                                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition disabled:opacity-50"
                                            >
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
                            {/* No modal, usamos o subtotal APENAS do carrinho (cartSubtotal), pois listQuantities já foi fundido no cart */}
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Taxa de Entrega</span>
                                <span>{deliveryFee === 0 ? 'A calcular' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}</span>
                            </div>
                            <div className="flex justify-between font-black text-xl text-gray-800 pt-2 border-t border-dashed border-gray-200 mt-2">
                                <span>Total</span>
                                <span>R$ {(cartSubtotal + deliveryFee).toFixed(2).replace('.', ',')}</span>
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

      {/* MODAL: IMAGEM EM TELA CHEIA */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            <img 
              src={selectedImage} 
              alt="Visualização ampliada" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
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


// --- COMPONENTE APP PRINCIPAL (Wrapper para execução) ---
const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Hamburger Clássico',
    description: 'Pão de brioche, carne de 180g, queijo cheddar, bacon, alface e molho da casa.',
    price: 32.50,
    image: 'https://placehold.co/300x300/FEE2E2/DC2626?text=BURGUER',
    order: 1,
  },
  {
    id: 'p2',
    name: 'Batata Frita Rustica',
    description: 'Batatas rústicas fritas, crocantes por fora e macias por dentro, com alecrim e sal marinho.',
    price: 15.00,
    image: 'https://placehold.co/300x300/FFFBEB/D97706?text=FRITAS',
    order: 2,
  },
  {
    id: 'p3',
    name: 'Refrigerante Cola Zero',
    description: 'Lata de 350ml. Zero açúcar, sabor refrescante.',
    price: 6.00,
    image: 'https://placehold.co/300x300/F0F9FF/0284C7?text=REFRIGERANTE',
    order: 3,
  },
  {
    id: 'p4',
    name: 'Combo Família',
    description: '2 Hamburgueres Clássicos, 1 Batata Frita Grande e 2 Refrigerantes.',
    price: 75.90,
    image: 'https://placehold.co/300x300/ECFDF5/059669?text=COMBO',
    order: 4,
  },
];

const mockSettings: StoreSettings = {
  name: 'Burguer do Chef',
  whatsapp: '5521987654321', // Exemplo: 55 (código país) 21 (DDD) 987654321 (Número)
  deliveryFee: 10.00,
  isOpen: true,
  logoUrl: 'https://placehold.co/100x100/D93F3E/FFFFFF?text=BC',
  bannerMessage: 'O melhor hambúrguer artesanal da cidade! Peça o seu agora.',
};

const App = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
  };
  
  if (isAdminOpen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <Lock size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Administrativo</h1>
          <p className="text-gray-600 mb-6">Esta é a área restrita. Em uma aplicação completa, você seria redirecionado para a tela de login/gerenciamento.</p>
          <button 
            onClick={() => setIsAdminOpen(false)}
            className="w-full bg-[#D93F3E] text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <CustomerView 
      products={mockProducts} 
      settings={mockSettings} 
      onOpenAdmin={handleOpenAdmin} 
    />
  );
};

export default App;
