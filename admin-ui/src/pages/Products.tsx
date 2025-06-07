import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, ArrowUpDown, Loader, Download, Check, Eye } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProductModal from '../components/products/ProductModal';
import GameClientProductViewer from '../components/products/GameClientProductViewer';
import { 
  useGetProductsQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation,
  useGetGamesQuery
} from '../api/apiSlice';
import { useLazyExportSteamItemdefQuery } from '../api/exportApi';

import { Product } from '../types/product';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | undefined>(undefined);
  const [showClientView, setShowClientView] = useState(false);
  
  // Fetch products from API
  const { data: productsData, isLoading, isError, refetch } = useGetProductsQuery({ active_only: activeOnly });
  const { data: gamesData, isLoading: isLoadingGames } = useGetGamesQuery({});
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  
  // Steam itemdef export
  const [exportSteamItemdef, { isLoading: isExporting }] = useLazyExportSteamItemdefQuery();
  
  // Filter products based on search term
  const filteredProducts = productsData ? productsData.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];
  
  const handleAddProduct = () => {
    setCurrentProduct(null); // Reset current product for add mode
    setIsModalOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price_cents ? (product.price_cents / 100) : undefined,
      price_cents: product.price_cents,
      type: product.type,
      active: product.active,
      game_id: product.game_id,
      steam_app_id: product.steam_app_id,
      steam_item_id: product.steam_item_id,
      steam_category: product.steam_category,
      // Image URLs
      icon_url: product.icon_url,
      icon_url_large: product.icon_url_large,
      // Steam attributes
      marketable: product.marketable,
      tradable: product.tradable,
      store_bundle: product.store_bundle,
      quantity: product.quantity,
      tags: product.tags,
      store_tags: product.store_tags,
      store_categories: product.store_categories,
      background_color: product.background_color
    });
    setIsModalOpen(true);
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        // Refetch products after deletion
        refetch();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };
  
  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      if (product._id) {
        // Update existing product
        const productId = product._id;
        
        // Remove _id from the update data
        const { _id, ...updateData } = product;
        
        await updateProduct({ 
          id: productId, 
          product: updateData 
        }).unwrap();
      } else {
        // Add new product
        await createProduct(product).unwrap();
      }
      
      // Refetch products after save
      refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };
  
  // Toggle between showing all products or only active ones
  const toggleActiveFilter = () => {
    setActiveOnly(!activeOnly);
  };
  
  // Handle Steam itemdef export
  const handleExportSteamItemdef = () => {
    exportSteamItemdef({ gameId: selectedGameId });
  };
  
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Products</h2>
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            icon={<Download size={16} />}
            onClick={handleExportSteamItemdef}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Steam Itemdef'}
          </Button>
          <Button 
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline"
            icon={<ArrowUpDown size={16} />}
            onClick={toggleActiveFilter}
          >
            {activeOnly ? 'Show All' : 'Show Active Only'}
          </Button>
          <Button 
            variant="outline"
            icon={showClientView ? <Check size={16} /> : <Eye size={16} />}
            onClick={() => setShowClientView(!showClientView)}
          >
            {showClientView ? 'Hide Client View' : 'Show Client View'}
          </Button>
        </div>
        
        {showClientView && (
          <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Game Client Product Preview</h3>
            
            <div className="flex gap-4 items-center">
              <div className="w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Game
                </label>
                <select
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={selectedGameId || ''}
                  onChange={e => setSelectedGameId(e.target.value || undefined)}
                >
                  <option value="">Select a game...</option>
                  {gamesData?.data?.map(game => (
                    <option key={game._id} value={game._id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-500">
                This shows how your products will look in game clients using the new /game-client/products endpoint
              </div>
            </div>
            
            {selectedGameId && <GameClientProductViewer gameId={selectedGameId} />}
          </div>
        )}
      </div>
      
      {/* Products table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader className="animate-spin mr-2" size={20} />
              <span>Loading products...</span>
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-red-500">
              Error loading products. Please try again.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        {product.icon_url && (
                          <img 
                            src={product.icon_url} 
                            alt={product.name} 
                            className="w-10 h-10 mr-3 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                          {product.game_name && (
                            <div className="text-xs text-gray-400 mt-1">
                              Game: {product.game_name}
                            </div>
                          )}
                          {product.steam_app_id && (
                            <div className="text-xs text-gray-400 mt-1">
                              Steam App ID: {product.steam_app_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(product.price_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash size={16} />}
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No products found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={currentProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Products;