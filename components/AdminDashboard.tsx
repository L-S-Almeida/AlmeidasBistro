import React, { useState, useRef } from 'react';
import { Product, StoreSettings } from '../types';
import { 
  LogOut, Plus, Edit3, Trash2, Settings, Store, 
  GripVertical, Save, X, Upload, ArrowUpDown, Image,
  Power, Check, XCircle
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

// Componente Sortable para os produtos
const SortableProductItem = ({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: product.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start group animate-in fade-in slide-in-from-bottom-2"
    >
      {/* Handle de arrastar */}
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-center h-24 w-8 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </div>

      {/* Foto do Produto */}
      <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden relative group/img">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/eee/999?text=Produto'; }}
        />
      </div>

      {/* Informações */}
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-black text-lg text-[#D93F3E]">
            R$ {Number(product.price).toFixed(2)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AdminDashboardProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  settings,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states - COM CAMPO driveUrl ADICIONADO
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    driveUrl: '' // NOVO CAMPO PARA GOOGLE DRIVE
  });

  const [settingsForm, setSettingsForm] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Ordenar produtos pela ordem
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);

  // Handler para quando o drag termina
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedProducts.findIndex((p) => p.id === active.id);
      const newIndex = sortedProducts.findIndex((p) => p.id === over.id);
      
      const reorderedProducts = arrayMove(sortedProducts, oldIndex, newIndex);
      
      // Atualizar a ordem de cada produto
      reorderedProducts.forEach((product, index) => {
        onEditProduct(product.id, { ...product, order: index + 1 });
      });
    }
  };

  // Toggle status da loja
  const toggleStoreStatus = () => {
    const newSettings = { ...settingsForm, isOpen: !settingsForm.isOpen };
    setSettingsForm(newSettings);
    onUpdateSettings(newSettings);
  };

  // Upload de imagem para produto
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Em produção, você faria upload para Firebase Storage ou outro serviço
      // Por enquanto, vamos criar uma URL local para demonstração
      const imageUrl = URL.createObjectURL(file);
      setProductForm({ ...productForm, image: imageUrl });
    }
  };

  // Upload de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const logoUrl = URL.createObjectURL(file);
      setSettingsForm({ ...settingsForm, logoUrl });
    }
  };

  // NOVA FUNÇÃO: Converter link do Drive para link de imagem direto
  const convertDriveUrl = (driveUrl: string): string => {
    try {
      // Padrão 1: https://drive.google.com/file/d/ID_DA_IMAGEM/view
      const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
      
      // Padrão 2: Já está no formato correto
      if (driveUrl.includes('uc?export=view&id=')) {
        return driveUrl;
      }
      
      return driveUrl; // Retorna original se não conseguir converter
    } catch (error) {
      return driveUrl; // Retorna original em caso de erro
    }
  };

  // NOVA FUNÇÃO: Quando o usuário cola URL do Drive
  const handleDriveUrlChange = (driveUrl: string) => {
    const convertedUrl = convertDriveUrl(driveUrl);
    setProductForm({ 
      ...productForm, 
      driveUrl: driveUrl,
      image: convertedUrl // Atualiza a imagem automaticamente
    });
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.price) return;

    const newProduct: Omit<Product, 'id'> = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      image: productForm.image || 'https://placehold.co/400x400/eee/999?text=Produto',
      order: products.length + 1
    };

    onAddProduct(newProduct);
    setProductForm({ name: '', description: '', price: '', image: '', driveUrl: '' });
    setIsAddingProduct(false);
  };

  const handleEditProduct = () => {
    if (!editingProduct || !productForm.name || !productForm.price) return;

    onEditProduct(editingProduct.id, {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      image: productForm.image,
    });

    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', image: '', driveUrl: '' });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      driveUrl: '' // Reseta o campo driveUrl ao editar
    });
  };

  const handleSaveSettings = () => {
    onUpdateSettings(settingsForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Status da Loja NO TOPO */}
      <div className={`${settingsForm.isOpen ? 'bg-green-600' : 'bg-red-700'} text-white shadow-lg sticky top-0 z-40`}>
        <div className="max-w-6xl mx-auto">
          {/* Status da Loja - AGORA NO TOPO */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${settingsForm.isOpen ? 'bg-green-500' : 'bg-red-600'}`}>
                <Power size={20} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">
                  {settingsForm.isOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}
                </span>
                <p className="text-white/80 text-sm">
                  {settingsForm.isOpen ? 'Clientes podem fazer pedidos' : 'Pedidos desativados'}
                </p>
              </div>
            </div>
            
            {/* Botão Liga/Desliga */}
            <button
              onClick={toggleStoreStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                settingsForm.isOpen 
                  ? 'bg-white text-green-600 hover:bg-green-50' 
                  : 'bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              {settingsForm.isOpen ? (
                <>
                  <Check size={18} />
                  Aberta
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  Fechada
                </>
              )}
            </button>
          </div>

          {/* Logo e Navegação */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/30 shadow-inner group/logo">
                  {settingsForm.logoUrl ? (
                    <img 
                      src={settingsForm.logoUrl} 
                      alt="Logo" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white transition-transform duration-300 group-hover/logo:scale-110" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-600 border-2 border-white">
                      <Store size={28} />
                    </div>
                  )}
                </div>
                
                {/* Nome da Loja */}
                <div className="text-white">
                  <h1 className="text-2xl font-black leading-none mb-1 drop-shadow-md">
                    {settingsForm.name || "Almeidas Bistrô"}
                  </h1>
                  <p className="text-white/80 text-sm">Painel Administrativo</p>
                </div>
              </div>

              {/* Botão Sair */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition backdrop-blur-sm border border-white/20"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white/10 rounded-lg p-1 backdrop-blur-sm border border-white/20">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-2 px-4 font-medium rounded-md transition ${
                    activeTab === 'products'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Gerenciar Cardápio
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-2 px-4 font-medium rounded-md transition ${
                    activeTab === 'settings'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings size={16} className="inline mr-2" />
                  Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6 pt-8">
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header do Cardápio */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Cardápio</h2>
                <p className="text-gray-600">
                  Arraste e solte para reordenar os produtos
                  <ArrowUpDown size={16} className="inline ml-2" />
                </p>
              </div>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="bg-[#D93F3E] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            </div>

            {/* Lista de Produtos com Drag & Drop */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Store size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nenhum produto cadastrado</p>
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="mt-4 bg-[#D93F3E] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Adicionar Primeiro Produto
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sortedProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {sortedProducts.map((product) => (
                      <SortableProductItem
                        key={product.id}
                        product={product}
                        onEdit={startEdit}
                        onDelete={onDeleteProduct}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Configurações da Loja</h2>
            
            <div className="grid gap-6">
              {/* Configurações Básicas */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Loja
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100"
                      placeholder="Almeidas Bistrô"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp para Pedidos
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({...settingsForm, whatsapp: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100"
                      placeholder="5598991414917"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem do Banner
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bannerMessage}
                      onChange={(e) => setSettingsForm({...settingsForm, bannerMessage: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100"
                      placeholder="Seu Pedido Chega Quentinho!"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Entrega (R$)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.deliveryFee}
                      onChange={(e) => setSettingsForm({...settingsForm, deliveryFee: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Logo da Loja com Upload */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Image size={20} /> Logo da Loja
                </h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                      {settingsForm.logoUrl ? (
                        <img 
                          src={settingsForm.logoUrl} 
                          alt="Logo" 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          <Image size={32} className="mx-auto mb-2" />
                          <span className="text-xs">Sem logo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => logoFileInputRef.current?.click()}
                      className="bg-[#D93F3E] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center gap-2 mb-3"
                    >
                      <Upload size={18} />
                      Escolher Logo
                    </button>
                    <p className="text-sm text-gray-500">
                      Clique para selecionar uma imagem do seu computador
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="bg-[#D93F3E] text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg"
            >
              <Save size={20} />
              Salvar Configurações
            </button>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Product - ATUALIZADO COM GOOGLE DRIVE */}
      {(isAddingProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100"
                  placeholder="Ex: Mocotó 700ml Completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100 resize-none"
                  rows={3}
                  placeholder="Ex: Arroz, farofa e pirão (serve até 2 pessoas)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Produto
                </label>
                
                {/* Preview da Imagem */}
                {productForm.image && (
                  <div className="mb-3">
                    <img 
                      src={productForm.image} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-green-600 mt-1">✓ Preview da imagem</p>
                  </div>
                )}
                
                {/* SEÇÃO GOOGLE DRIVE - NOVA */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔗 Google Drive (Recomendado)
                  </label>
                  <input
                    type="text"
                    value={productForm.driveUrl}
                    onChange={(e) => handleDriveUrlChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#D93F3E] focus:ring-2 focus:ring-red-100"
                    placeholder="Cole aqui o link do Google Drive..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cole o link do Drive → A imagem aparecerá automaticamente
                  </p>
                </div>

                {/* Upload tradicional (mantido como alternativa) */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">📤 Ou faça upload tradicional:</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:bg-gray-200 transition flex flex-col items-center gap-2"
                  >
                    <Upload size={24} />
                    <span>Clique para selecionar imagem</span>
                    <span className="text-sm text-gray-500">ou arraste e solte</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                disabled={!productForm.name || !productForm.price}
                className="flex-1 bg-[#D93F3E] text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
              </button>
              <button
                onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                  setProductForm({ name: '', description: '', price: '', image: '', driveUrl: '' });
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
