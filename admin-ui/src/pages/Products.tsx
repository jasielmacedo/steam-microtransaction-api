import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, ArrowUpDown } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProductModal from '../components/products/ProductModal';

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Premium Coins Pack',
    description: '1000 premium coins for in-game purchases',
    price: 29.99,
    type: 'Currency',
    active: true,
  },
  {
    id: '2',
    name: 'Exotic Weapon Skin',
    description: 'Limited edition weapon skin with special effects',
    price: 19.99,
    type: 'Cosmetic',
    active: true,
  },
  {
    id: '3',
    name: 'Character Boost',
    description: 'Instantly level up your character to max level',
    price: 24.99,
    type: 'Booster',
    active: true,
  },
  {
    id: '4',
    name: 'Battle Pass',
    description: 'Unlock premium rewards as you play',
    price: 9.99,
    type: 'Subscription',
    active: true,
  },
  {
    id: '5',
    name: 'Legendary Mount',
    description: 'Exclusive mount with unique appearance and speed boost',
    price: 14.99,
    type: 'Cosmetic',
    active: false,
  },
  {
    id: '6',
    name: 'Elite Armor Set',
    description: 'Complete armor set with set bonuses',
    price: 34.99,
    type: 'Equipment',
    active: true,
  },
];

const Products: React.FC = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddProduct = () => {
    setCurrentProduct(null); // Reset current product for add mode
    setIsModalOpen(true);
  };
  
  const handleEditProduct = (product: any) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };
  
  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(product => product.id !== id));
    }
  };
  
  const handleSaveProduct = (product: any) => {
    if (product.id) {
      // Update existing product
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      // Add new product
      const newProduct = {
        ...product,
        id: (products.length + 1).toString(),
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };
  
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Products</h2>
        <Button 
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
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
          >
            Sort
          </Button>
        </div>
      </div>
      
      {/* Products table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
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
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price.toFixed(2)}
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
                      onClick={() => handleDeleteProduct(product.id)}
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