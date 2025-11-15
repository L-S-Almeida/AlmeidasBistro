import React, { useState, useRef } from 'react';
import { Product, StoreSettings } from '../types';
import { Save, Plus, Trash2, Edit2, LogOut, Image as ImageIcon, Power, Phone, Store, DollarSign, Upload, Type, Camera } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onLogout: () => void;
}

// Helper para converter arquivo em string (Base64)
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  settings,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateSettings,
  onLogout,
}) => {
  // Settings State
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Menu State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for Settings ---

  // Toggle Open/Closed (Saves Immediately)
  const handleToggleOpen = () => {
    const newSettings = { ...localSettings, isOpen: !localSettings.isOpen };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  // Handle Text Inputs (Buffers changes)
  const handleSettingChange = (field: keyof StoreSettings, value: string | number) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setSettingsChanged(true);
  };

  // Handle Image Upload for Settings
  const handleSettingsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof StoreSettings) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              // Limite de 2MB
              if (file.size > 2 * 1024 * 1024) {
                  alert("A imagem é muito grande. Tente uma menor que 2MB.");
                  return;
              }
              const base64 = await convertFileToBase64(file);
              handleSettingChange(field, base64);
          } catch (error) {
              alert("Erro ao processar imagem.");
          }
      }
  };

  // Save Buffered Settings
  const saveSettings = () => {
    onUpdateSettings(localSettings);
    setSettingsChanged(false);
    alert('Configurações salvas com sucesso!');
  };

  // --- Handlers for Menu ---

  const handleEditProductClick = (product: Product) => {
    setEditingProduct({ ...product });
    setIsFormOpen(true);
  };

  const handleAddProductClick = () => {
    setEditingProduct({
      name: '',
      price: 0,
      description: '',
      image: '',
      category: ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteProductClick = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
        onDeleteProduct(id);
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
        try {
             if (file.size > 2 * 1024 * 1024) {
                  alert("A imagem é muito grande. Tente uma menor que 2MB.");
                  return;
              }
            const base64 = await convertFileToBase64(file);
            setEditingProduct({ ...editingProduct, image: base64 });
        } catch (error) {
            alert("Erro ao processar imagem.");
        }
    }
  };

  const saveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setIsSavingProduct(true);

    try {
        const productData = {
            name: editingProduct.name!,
            price: editingProduct.price!,
            description: editingProduct.description!,
            image: editingProduct.image || 'https://placehold.co/600x400/png?text=Sem+Foto',
            category: editingProduct.category || ''
        };

        if (editingProduct.id) {
            await onEditProduct(editingProduct.id, productData);
        } else {
            await onAddProduct(productData);
        }
        
        setIsFormOpen(false);
        setEditingProduct(null);
    } catch (error) {
        console.error(error);
        alert("Erro ao salvar produto.");
    } finally {
        setIsSavingProduct(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Mobile/Desktop */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-800">
            <div className="bg-primary text-white p-1.5 rounded font-bold text-xs">ADM</div>
            <h1 className="font-bold text-lg sm:text-xl">Painel Administrativo</h1>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition font-medium text-sm"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        
        {/* 1. Store Status Card (Redesigned to match Customer Header) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className={`col-span-1 p-6 rounded-2xl shadow-lg text-white transition-colors duration-500 flex flex-col justify-between relative overflow-hidden ${localSettings.isOpen ? 'bg-green-500' : 'bg-red-600'}`}>
                
                {/* Content imitating Customer Header */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md shadow-inner flex-shrink-0">
                            {localSettings.logoUrl ? (
                                <img src={localSettings.logoUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                                    <Store size={28} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black leading-none mb-1 drop-shadow-md">{localSettings.name || "Nome da Loja"}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${localSettings.isOpen ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}></span>
                                <span className="text-sm font-bold opacity-90 tracking-wide uppercase">{localSettings.isOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toggle Button */}
                <div className="mt-2 relative z-10">
                    <button 
                        onClick={handleToggleOpen}
                        className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-xl shadow-md hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Power size={20} className={localSettings.isOpen ? "text-red-600" : "text-green-600"} />
                        {localSettings.isOpen ? 'Fechar Agora' : 'Abrir Loja Agora'}
                    </button>
                </div>

                {/* Decoration */}
                <div className="absolute -right-6 -bottom-6 text-white/10 transform rotate-12">
                    <Store size={120} />
                </div>
            </div>

            {/* Settings Form */}
            <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Edit2 size={20} className="text-primary" /> Configurações da Loja
                    </h2>
                    {settingsChanged && (
                         <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded animate-pulse border border-amber-100">
                            Alterações não salvas
                         </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Nome da Loja */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Loja (Cabeçalho)</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={localSettings.name}
                                onChange={(e) => handleSettingChange('name', e.target.value)}
                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition outline-none font-medium"
                                placeholder="Ex: Almeidas Bistrô"
                            />
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp do Pedido</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={localSettings.whatsapp}
                                onChange={(e) => handleSettingChange('whatsapp', e.target.value)}
                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition outline-none"
                                placeholder="5599..."
                            />
                        </div>
                    </div>
                    
                    {/* Taxa */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Taxa de Entrega Fixa (R$)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="number" 
                                min="0"
                                step="0.50"
                                value={localSettings.deliveryFee ?? 0}
                                onChange={(e) => handleSettingChange('deliveryFee', parseFloat(e.target.value))}
                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition outline-none"
                                placeholder="0.00"
                            />
                        </div>
                         <p className="text-[10px] text-gray-400 mt-1">Deixe R$ 0,00 para "A calcular".</p>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frase do Banner (Destaque)</label>
                        <input 
                            type="text" 
                            value={localSettings.bannerMessage}
                            onChange={(e) => handleSettingChange('bannerMessage', e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition outline-none"
                        />
                    </div>
                    
                    {/* Logo Upload */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo da Loja</label>
                        <div 
                            onClick={() => logoInputRef.current?.click()}
                            className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition group"
                        >
                            <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative shadow-sm">
                                {localSettings.logoUrl ? (
                                    <img src={localSettings.logoUrl} className="w-full h-full object-cover" alt="Logo Preview" />
                                ) : (
                                    <Store className="text-gray-300" />
                                )}
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={logoInputRef}
                                    className="hidden"
                                    onChange={(e) => handleSettingsImageUpload(e, 'logoUrl')}
                                />
                                <span className="block font-bold text-gray-700 text-sm group-hover:text-primary transition">Toque para alterar a logo</span>
                                <p className="text-xs text-gray-400 mt-1">Recomendado: Imagem quadrada.</p>
                            </div>
                            <Upload size={20} className="text-gray-400 mr-2" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                     <button 
                        onClick={saveSettings}
                        disabled={!settingsChanged}
                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm text-base
                            ${settingsChanged 
                                ? 'bg-primary text-white hover:bg-red-600 hover:shadow-md cursor-pointer transform active:scale-[0.98]' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                     >
                        <Save size={20} />
                        Salvar Configurações
                     </button>
                </div>
            </div>
        </section>

        {/* 2. Product Management */}
        <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Cardápio</h2>
                    <p className="text-gray-500 text-sm">Gerencie os produtos disponíveis para seus clientes.</p>
                </div>
                <button 
                    onClick={handleAddProductClick}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center gap-2 font-bold w-full sm:w-auto justify-center active:scale-95"
                >
                    <Plus size={20} /> Adicionar Produto
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Store size={32} className="opacity-30" />
                        </div>
                        <p>Nenhum produto cadastrado.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {products.map(product => (
                            <div key={product.id} className="p-4 hover:bg-gray-50 transition flex items-center gap-4 group">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Foto'; }}
                                    />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-gray-800 truncate text-base">{product.name}</h3>
                                        {/* Optional Category Tag */}
                                        {product.category && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide border border-gray-200">{product.category}</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate hidden sm:block">{product.description}</p>
                                    <p className="text-primary font-bold text-sm sm:text-base mt-0.5">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button 
                                        onClick={() => handleEditProductClick(product)}
                                        className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteProductClick(product.id)}
                                        className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>

      </main>

      {/* Modal for Product Editing/Adding */}
      {isFormOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-gray-800">{editingProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                    <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <Plus size={24} className="rotate-45 text-gray-500" />
                    </button>
                </div>
                
                <form onSubmit={saveProductForm} className="p-6 space-y-5 overflow-y-auto">
                    {/* Field: Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Produto</label>
                        <input 
                            required
                            type="text" 
                            value={editingProduct.name || ''}
                            onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            placeholder="Ex: Mocotó Completo"
                        />
                    </div>

                    {/* Field: Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                        <textarea 
                            required
                            rows={3}
                            value={editingProduct.description || ''}
                            onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none"
                            placeholder="Ex: Acompanha arroz, farofa..."
                        />
                    </div>

                    {/* Row: Price & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Preço (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                                <input 
                                    required
                                    type="number" 
                                    step="0.01"
                                    min="0"
                                    value={editingProduct.price || ''}
                                    onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                    className="w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoria <span className="text-gray-400 font-normal">(Opcional)</span></label>
                            <input 
                                type="text" 
                                value={editingProduct.category || ''}
                                onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                placeholder="Ex: Bebidas"
                            />
                        </div>
                    </div>

                    {/* Field: Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Foto do Produto</label>
                        <div 
                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition relative overflow-hidden group"
                            onClick={() => productImageInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                accept="image/*"
                                ref={productImageInputRef}
                                className="hidden"
                                onChange={handleProductImageUpload}
                            />
                            
                            {editingProduct.image ? (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                    <img src={editingProduct.image} className="w-full h-full object-cover" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold flex items-center gap-2"><Camera size={24}/> Trocar Foto</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-gray-400">
                                    <div className="bg-gray-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                        <Camera size={32} className="text-gray-400"/>
                                    </div>
                                    <p className="text-sm font-bold text-gray-600">Toque para enviar foto</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isSavingProduct}
                            className={`w-full bg-primary text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2
                                ${isSavingProduct ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600 active:scale-[0.98]'}`}
                        >
                            {isSavingProduct ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={20} /> Salvar Produto</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};