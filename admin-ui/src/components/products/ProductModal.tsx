import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import HelpTooltip from '../ui/HelpTooltip';
import { useGetGamesQuery, Game } from '../../api/gamesApi';

// Product type options for the dropdown
const PRODUCT_TYPES = [
  { value: 'Currency', label: 'Currency' },
  { value: 'Cosmetic', label: 'Cosmetic' },
  { value: 'Booster', label: 'Booster' },
  { value: 'Subscription', label: 'Subscription' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Bundle', label: 'Bundle' },
  { value: 'Content', label: 'Content' },
  { value: 'Consumable', label: 'Consumable' },
];

// Steam category options for the dropdown
const STEAM_CATEGORIES = [
  { value: 'consumable', label: 'Consumable' },
  { value: 'durable', label: 'Durable' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'currency', label: 'Currency' },
  { value: 'item', label: 'Item' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'character', label: 'Character' },
  { value: 'skin', label: 'Skin' },
  { value: 'card', label: 'Card' },
  { value: 'boost', label: 'Boost' },
  { value: 'dlc', label: 'DLC' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'service', label: 'Service' },
];

// Product interface matching the backend schema
interface Product {
  _id?: string;
  name: string;
  description: string;
  price?: number;  // Legacy field, using decimal dollars
  price_cents?: number; // New field, using integer cents
  type: string;
  active: boolean;
  game_id?: string;
  game_name?: string;
  steam_category?: string;
  // Image URLs
  icon_url?: string;
  icon_url_large?: string;
  // Steam attributes
  marketable?: boolean;
  tradable?: boolean;
  store_bundle?: boolean;
  quantity?: number;
  tags?: string[];
  store_tags?: string[];
  store_categories?: string[];
  background_color?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  product: Partial<Product> | null;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    price_cents: 0,
    type: 'Currency',
    active: true,
    game_id: '',
    steam_category: '',
    icon_url: '',
    icon_url_large: '',
    marketable: false,
    tradable: false,
    store_bundle: false,
    quantity: 1,
    tags: [],
    store_tags: [],
    store_categories: [],
    background_color: '',
  });
  
  // Fetch games for the dropdown
  const { data: games, isLoading: isLoadingGames } = useGetGamesQuery({ 
    page: 1, 
    size: 100 
  });
  
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    price: '',
  });
  
  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({ 
          ...formData,
          ...product 
        });
      } else {
        setFormData({
          _id: undefined,
          name: '',
          description: '',
          price: 0,
          price_cents: 0,
          type: 'Currency',
          active: true,
          game_id: '',
          steam_category: '',
          icon_url: '',
          icon_url_large: '',
          marketable: false,
          tradable: false,
          store_bundle: false,
          quantity: 1,
          tags: [],
          store_tags: [],
          store_categories: [],
          background_color: '',
        });
      }
      setErrors({
        name: '',
        description: '',
        price: '',
      });
    }
  }, [isOpen, product]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else if (name === 'price') {
      // Convert price to number and update price_cents as well
      const priceValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        price: priceValue,
        price_cents: Math.round(priceValue * 100),
      });
    } else if (name === 'quantity') {
      // Convert quantity to number
      setFormData({
        ...formData,
        [name]: parseInt(value) || 1,
      });
    } else if (name === 'game_id') {
      // Just update the game_id - the backend will handle the steam_app_id automatically
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (name.includes('tags') || name.includes('categories')) {
      // Handle array fields - comma-separated values
      const arrayValues = value.split(',').map(item => item.trim());
      setFormData({
        ...formData,
        [name]: arrayValues,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      description: '',
      price: '',
    };
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
      isValid = false;
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Product description is required';
      isValid = false;
    }
    
    if (formData.price && formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Remove steam_app_id from the data since it should come from the selected game
      const { steam_app_id, ...productData } = formData;
      onSave(productData);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full mx-4">
          <div className="bg-white px-6 pt-6 pb-6 sm:p-8 sm:pb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {product?._id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Basic Product Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">Basic Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Input
                        label="Product Name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        error={errors.name}
                        required
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="Price ($)"
                        name="price"
                        type="number"
                        value={formData.price?.toString() || '0'}
                        onChange={handleChange}
                        placeholder="0.00"
                        error={errors.price}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Enter product description"
                      rows={3}
                      className={`
                        w-full rounded-md shadow-sm px-4 py-2
                        ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                        focus:border-transparent focus:outline-none
                        transition duration-150 ease-in-out text-base
                      `}
                      required
                    ></textarea>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Type
                    </label>
                    <select
                      name="type"
                      value={formData.type || 'Currency'}
                      onChange={handleChange}
                      className="
                        w-full rounded-md shadow-sm px-4 py-2
                        border-gray-300 focus:ring-blue-500
                        focus:border-transparent focus:outline-none
                        transition duration-150 ease-in-out
                        cursor-pointer text-base
                      "
                    >
                      {PRODUCT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center mt-3">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      checked={formData.active !== undefined ? formData.active : true}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
                
                {/* Game & Steam Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Game & Steam Settings</h4>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game
                    </label>
                    <select
                      name="game_id"
                      value={formData.game_id || ''}
                      onChange={handleChange}
                      className="
                        w-full rounded-md shadow-sm px-4 py-2
                        border-gray-300 focus:ring-blue-500
                        focus:border-transparent focus:outline-none
                        transition duration-150 ease-in-out
                        cursor-pointer text-base
                      "
                    >
                      <option value="">-- Select a game --</option>
                      {games?.items.map((game) => (
                        <option key={game._id} value={game._id}>
                          {game.name} ({game.steam_app_id})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select the game this product belongs to. The Steam App ID will be 
                      automatically used from the selected game.
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Steam Category
                    </label>
                    <select
                      name="steam_category"
                      value={formData.steam_category || ''}
                      onChange={handleChange}
                      className="
                        w-full rounded-md shadow-sm px-4 py-2
                        border-gray-300 focus:ring-blue-500
                        focus:border-transparent focus:outline-none
                        transition duration-150 ease-in-out
                        cursor-pointer text-base
                      "
                    >
                      <option value="">-- Select a category (optional) --</option>
                      {STEAM_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select how this item should be categorized in Steam
                    </p>
                  </div>
                </div>

                {/* Steam Image Settings */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Images & Additional Steam Settings</h4>
                  
                  <div className="mb-3">
                    <Input
                      label="Icon URL"
                      name="icon_url"
                      value={formData.icon_url || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/icon.png"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL to a small icon image for this product
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Large Icon URL"
                      name="icon_url_large"
                      value={formData.icon_url_large || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/large-icon.png"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL to a large icon image for this product
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Background Color"
                      name="background_color"
                      value={formData.background_color || ''}
                      onChange={handleChange}
                      placeholder="e.g., FFD700 (Hex color without #)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Hex color code for display (without #)
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Tags (comma-separated)"
                      name="tags"
                      value={formData.tags?.join(', ') || ''}
                      onChange={handleChange}
                      placeholder="weapon, rare, epic"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tags for this product (comma-separated)
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Store Tags (comma-separated)"
                      name="store_tags"
                      value={formData.store_tags?.join(', ') || ''}
                      onChange={handleChange}
                      placeholder="Featured, New, Sale"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tags for the store page (comma-separated)
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Store Categories (comma-separated)"
                      name="store_categories"
                      value={formData.store_categories?.join(', ') || ''}
                      onChange={handleChange}
                      placeholder="Weapons, Cosmetics, Currency"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Categories for the store page (comma-separated)
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Quantity"
                      name="quantity"
                      type="number"
                      value={formData.quantity?.toString() || '1'}
                      onChange={handleChange}
                      placeholder="1"
                      min="1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Default quantity per purchase (usually 1)
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <input
                        id="marketable"
                        name="marketable"
                        type="checkbox"
                        checked={formData.marketable}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="marketable" className="ml-2 block text-sm text-gray-700">
                        Marketable
                      </label>
                      <HelpTooltip content="When enabled, players can sell this item on the Steam Community Market to other players. Think of it like eBay for game items! Only enable if you want players to trade items for real money." />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="tradable"
                        name="tradable"
                        type="checkbox"
                        checked={formData.tradable}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="tradable" className="ml-2 block text-sm text-gray-700">
                        Tradable
                      </label>
                      <HelpTooltip content="Players can trade this item directly with their friends through Steam, like swapping Pokemon cards! This doesn't involve money, just player-to-player exchanges." />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="store_bundle"
                        name="store_bundle"
                        type="checkbox"
                        checked={formData.store_bundle}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="store_bundle" className="ml-2 block text-sm text-gray-700">
                        Store Bundle
                      </label>
                      <HelpTooltip content="This creates a bundle that can be sold in your Steam store page. It's like a combo deal - players buy this and get multiple items together, often at a discount!" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 sm:flex sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-3 sm:w-auto sm:mb-0 sm:mr-3"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  {product?._id ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;