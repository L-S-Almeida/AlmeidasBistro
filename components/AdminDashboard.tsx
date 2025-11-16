// ... código anterior mantido ...

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
  
  // Form states - ADICIONEI driveUrl
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    driveUrl: '' // NOVO CAMPO
  });

  const [settingsForm, setSettingsForm] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // ... código anterior mantido ...

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

  // ... código anterior mantido ...

  // MODIFIQUEI: handleAddProduct para usar a imagem do Drive
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

  // MODIFIQUEI: handleEditProduct também
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

  // MODIFIQUEI: startEdit também
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

  // ... código anterior mantido ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... header e tabs mantidos ... */}

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
                
                {/* NOVA SEÇÃO: Google Drive */}
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
