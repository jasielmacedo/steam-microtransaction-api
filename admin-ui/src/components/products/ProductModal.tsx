import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProductModalProps {
  isOpen: boolean;
  product: any | null;
  onClose: () => void;
  onSave: (product: any) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    type: 'Currency',
    active: true,
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
        setFormData({ ...product });
      } else {
        setFormData({
          id: '',
          name: '',
          description: '',
          price: 0,
          type: 'Currency',
          active: true,
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
      // Convert price to number
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
      isValid = false;
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {product ? 'Edit Product' : 'Add New Product'}
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
                <div>
                  <Input
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    error={errors.name}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={3}
                    className={`
                      w-full rounded-md shadow-sm
                      ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                      focus:border-transparent focus:outline-none
                      transition duration-150 ease-in-out
                    `}
                    required
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                
                <div>
                  <Input
                    label="Price ($)"
                    name="price"
                    type="number"
                    value={formData.price.toString()}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.price}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="
                      w-full rounded-md shadow-sm
                      border-gray-300 focus:ring-blue-500
                      focus:border-transparent focus:outline-none
                      transition duration-150 ease-in-out
                    "
                  >
                    <option value="Currency">Currency</option>
                    <option value="Cosmetic">Cosmetic</option>
                    <option value="Booster">Booster</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    id="active"
                    name="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
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
                  {product ? 'Update Product' : 'Add Product'}
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